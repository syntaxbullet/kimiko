import { Kimiko } from "@kimiko/types";
import { MessageStore } from "./MessageStore";
import { ToolRegistry } from "./ToolsRegistry";
import { LLMConfiguration } from "./LLMConfiguration";
import EventEmitter from "events";
import { config as dotenvConfig } from "dotenv";
import { ResponseBody } from "@kimiko/types/llm.types";

dotenvConfig();

/**
 * Represents the dependencies required to create an agent.
 * @typedef {Object} AgentDeps
 * @property {MessageStore} store - The message store for managing conversation history
 * @property {ToolRegistry} tools - The registry of available tools
 * @property {LLMConfiguration} config - The configuration for the LLM
 * @property {EventEmitter} events - An event emitter for handling agent events
 */
export type AgentDeps = {
    store: MessageStore,
    tools: ToolRegistry
    config: LLMConfiguration
    events: EventEmitter
}

/**
 * Defines the interface for an AI agent with methods for sending messages and handling tool calls.
 * @typedef {Object} Agent
 * @property {AgentDeps} ctx - The dependencies and context for the agent
 * @property {() => Promise<Kimiko.LLM.ResponseBody>} send - Method to send a message to the LLM
 * @property {(response: Kimiko.LLM.ResponseBody) => void} handleToolCalls - Method to process tool calls from the LLM response
 */
export type Agent = {
    ctx: AgentDeps
    send: () => Promise<Kimiko.LLM.ResponseBody>
    handleToolCalls: (response: Kimiko.LLM.ResponseBody) => void
}

/**
 * Creates an AI agent with capabilities to send messages and handle tool calls.
 * 
 * @param {AgentDeps} deps - The dependencies required for the agent
 * @param {Kimiko.LLM.SystemMessagePayload} systemMessage - The initial system message that defines the agent's context
 * @returns {Agent} A configured agent instance
 * 
 * @throws {Error} If required environment variables or configuration are missing
 * 
 * @example
 * const agent = createAgent({
 *   store: createMessageStore(),
 *   tools: createToolsRegistry(),
 *   config: createLLMConfiguration({ model: 'llama-3.3-70b-versatile' }),
 *   events: new EventEmitter()
 * }, { 
 *   role: 'system', 
 *   content: 'You are a helpful assistant.' 
 * });
 * 
 * await agent.send(); // Sends a message to the LLM
 */
export function createAgent(deps: AgentDeps, systemMessage: Kimiko.LLM.SystemMessagePayload): Agent {
    /**
     * Sends a message to the Large Language Model (LLM) with the current conversation context.
     * 
     * @async
     * @returns {Promise<Kimiko.LLM.ResponseBody>} The response from the LLM
     * @throws {Error} If the LLM API request fails or required configuration is missing
     * 
     * @private
     */
    async function send() {
        const payload = {
            ...deps.config.getAll(),
            messages: [
                systemMessage,
                ...deps.store.getAll().map(deps.store.toLLMMessage)
            ],
            tools: deps.tools.getDefinitions(),
        } as Kimiko.LLM.RequestBody
        
        // Validate required environment variables and configuration
        if (!process.env.LLM_API_URL) {
            throw new Error("LLM_API_URL is not set");
        }
        if (!process.env.LLM_API_KEY) {
            throw new Error("LLM_API_KEY is not set");
        }
        if (!deps.config.has("model")) {
            throw new Error("Model is not set");
        }

        // Make the API request to the LLM
        const response = await fetch(process.env.LLM_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.LLM_API_KEY}`,
            },
            body: JSON.stringify(payload)
        })

        // Handle API response errors
        if (!response.ok) {
            throw new Error(`LLM API returned ${response.status}: ${response.statusText}`);
        }

        const responseBody = (await response.json()) as Kimiko.LLM.ResponseBody
        
        // Handle tool calls if present
        if ("tool_calls" in responseBody.choices[0].message) {
           return await handleToolCalls(responseBody)
        }

        return responseBody
    }

    /**
     * Processes tool calls from the LLM response by executing the requested tools.
     * 
     * @async
     * @param {Kimiko.LLM.ResponseBody} response - The response from the LLM containing tool calls
     * @throws {Error} If a requested tool is not found in the tool registry
     * 
     * @private
     */
    async function handleToolCalls(response: Kimiko.LLM.ResponseBody): Promise<Kimiko.LLM.ResponseBody> {
        // Exit if no tool calls are present
        if (!("tool_calls" in response.choices[0].message)) {
            return response;
        }
        deps.events.emit("tools::call", response.choices[0].message.tool_calls)
        // Store the tool call message
        const toolCallMessage = deps.store.fromLLMMessage(response.choices[0].message)
        deps.store.append(toolCallMessage)

        // Process each tool call
        const toolCalls = response.choices[0].message.tool_calls as Kimiko.LLM.ToolCall[]
        
        for (const toolCall of toolCalls) {
            const name = toolCall.function.name
            const args = toolCall.function.arguments
            const tool = deps.tools.getHandler(name)

            // Validate tool existence
            if (!tool) {
                throw new Error(`Tool ${name} not found`);
            }

            // Execute the tool and store its response
            const toolResponse = await tool(deps, args)
            const toolResponseMessage: Kimiko.LLM.ToolMessagePayload = {
                role: "tool",
                content: toolResponse,
                tool_call_id: toolCall.id
            }
            deps.events.emit("tools::result", toolResponseMessage)
            deps.store.append(deps.store.fromLLMMessage(toolResponseMessage))
        }

        // Continue the conversation by sending the next message
        return send()
    }

    return {
        ctx: deps,
        send,
        handleToolCalls
    }
}