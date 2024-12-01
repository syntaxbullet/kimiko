import { Message } from "discord.js"
import { Kimiko } from ".."

/**
 * A decorator that adds tool functionality to an agent.
 * Configures the agent with specified tools and manages tool-related settings.
 */
export class ToolAgentDecorator implements Kimiko.Types.IKimikoAgent {

    private agent: Kimiko.Types.IKimikoAgent
    private tools: Kimiko.Types.Groq_LLM.LLMTool[]

    /**
     * Creates a new ToolAgentDecorator instance.
     * @param agent - The base agent to decorate with tool functionality
     * @param tools - Array of tools to make available to the agent
     * @param parallel_tool_calls - Whether to allow parallel tool calls (defaults to false)
     */
    constructor(agent: Kimiko.Types.IKimikoAgent, tools: Kimiko.Types.Groq_LLM.LLMTool[], parallel_tool_calls?: boolean) {
        this.agent = agent
        this.tools = tools

        this.agent.setConfig({
            ...this.agent.getConfig(),
            tools: this.tools,
            parallel_tool_calls: parallel_tool_calls ?? false
        })
    }

    /**
     * Adds a message to the conversation history.
     * @param message - The message to add, either an LLM message or a Discord message
     */
    addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload | Message): void {
        this.agent.addMessage(message)
    }

    /**
     * Gets all messages in the current conversation history.
     * @returns Array of LLM messages
     */
    getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this.agent.getMessages()
    }

    /**
     * Sets the conversation history messages.
     * @param messages - Array of LLM messages to set
     */
    setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): void {
        this.agent.setMessages(messages)
    }

    /**
     * Gets the current LLM configuration including tool settings.
     * @returns The LLM request configuration
     */
    getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this.agent.getConfig()
    }

    /**
     * Sets the LLM configuration while preserving tool settings.
     * @param config - The LLM request configuration to set
     */
    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): void {
        this.agent.setConfig(config)
    }

    /**
     * Gets the base URL for the LLM API.
     * @returns The base URL string
     */
    getBaseURL(): string {
        return this.agent.getBaseURL()
    }

    /**
     * Sets the base URL for the LLM API.
     * @param url - The base URL to set
     */
    setBaseURL(url: string): void {
        this.agent.setBaseURL(url)
    }

    /**
     * Converts a Discord message to an LLM message format.
     * @param message - The Discord message to convert
     * @returns The converted LLM message
     */
    convertDiscordMessage(message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        return this.agent.convertDiscordMessage(message)
    }

    /**
     * Sends the current conversation to the LLM for processing with tool configuration.
     * @returns A promise that resolves to the LLM's response
     */
    send(tool_choice?: Kimiko.Types.Groq_LLM.LLMToolChoice): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        this.agent.setConfig({
            ...this.agent.getConfig(),
            tool_choice: tool_choice
        })
        return this.agent.send()
    }
}
