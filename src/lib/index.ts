import { Message } from 'discord.js'
import { KimikoAgent } from './KimikoAgent'
import { KimikoClient } from './KimikoClient'
import KimikoConfigManager from './KimikoConfigManager'
import { KimikoContextManager } from './KimikoContextManager'
import { KimikoToolManager } from './KimikoToolManager'
/**
 * Main namespace for the Kimiko bot framework.
 * Contains all types, interfaces, and decorators used throughout the system.
 */
export namespace Kimiko {
    /**
     * Contains type definitions used throughout the Kimiko framework.
     */
    export namespace Types {
        /**
         * Types for interacting with the Groq LLM API.
         * Includes request/response types and tool definitions.
         */
        export namespace Groq_LLM {
            /**
             * Configuration for an LLM request.
             * Includes all possible parameters that can be sent to the Groq API.
             */
            export type LLMRequestBody = {
                frequency_penalty?: number
                logit_bias?: { [key: string]: number }
                logprobs?: boolean
                max_tokens?: number
                messages: LLMMessagePayload[]
                model: string
                n?: number
                parallel_tool_calls?: boolean
                presence_penalty?: number
                reponse_format?: LLMResponseFormat
                seed?: number
                stop?: string[]
                stream?: false // support only false
                stream_options?: LLMStreamOptions
                temperature?: number
                tool_choice?: LLMToolChoice
                tools?: LLMTool[]
                top_logprobs?: number
                top_p?: number
                user?: string
            }

            /**
             * Union type for all possible message payloads in the conversation.
             */
            export type LLMMessagePayload =
                | LLMSystemMessagePayload
                | LLMUserMessagePayload
                | LLMAssistantMessagePayload
                | LLMToolMessagePayload

            /**
             * System message in the conversation.
             * Used for setting context and behavior instructions.
             */
            export type LLMSystemMessagePayload = {
                role: 'system'
                content: string
                name?: string
            }

            /**
             * User message in the conversation.
             */
            export type LLMUserMessagePayload = {
                role: 'user'
                content: string
                name?: string
            }

            /**
             * Assistant (bot) message in the conversation.
             * May include tool calls if the assistant used any tools.
             */
            export type LLMAssistantMessagePayload = {
                role: 'assistant'
                content: string
                name?: string
                tool_calls?: LLMToolCall[]
            }

            /**
             * Tool response message in the conversation.
             */
            export type LLMToolMessagePayload = {
                role: 'tool'
                content: string
                tool_call_id: string
            }

            /**
             * Response format specification for the LLM.
             */
            export type LLMResponseFormat = { type: 'json_object' }

            /**
             * Stream options for the LLM request.
             */
            export type LLMStreamOptions = { include_usage: boolean } | null

            /**
             * Tool choice specification for the LLM.
             */
            export type LLMToolChoice =
                | string
                | { function: { name: string }; type: 'function' }

            /**
             * Tool call made by the assistant.
             */
            export type LLMToolCall = {
                function: { name: string; arguments: string }
                type: 'function'
                id: string
            }

            /**
             * Tool definition that can be used by the assistant.
             */
            export type LLMTool = {
                function: {
                    description: string
                    name: string
                    parameters?: LLMToolParameters
                }
                type: 'function'
            }

            /**
             * Parameters definition for a tool.
             */
            export type LLMToolParameters = {
                type: 'object'
                properties: { [key: string]: LLMToolProperty }
                required?: string[]
                additionalProperties?: boolean
            }

            /**
             * Union type for all possible tool parameter types.
             */
            export type LLMToolProperty =
                | JSONSchemaString
                | JSONSchemaNumber
                | JSONSchemaBoolean
                | JSONSchemaObject
                | JSONSchemaArray

            /**
             * String parameter type for tool parameters.
             */
            export type JSONSchemaString = {
                type: 'string'
                enum?: string[]
                description?: string
            }

            /**
             * Number parameter type for tool parameters.
             */
            export type JSONSchemaNumber = {
                type: 'number' | 'integer'
                enum?: number[]
                description?: string
            }

            /**
             * Boolean parameter type for tool parameters.
             */
            export type JSONSchemaBoolean = {
                type: 'boolean'
                description?: string
            }

            /**
             * Object parameter type for tool parameters.
             */
            export type JSONSchemaObject = LLMToolParameters

            /**
             * Array parameter type for tool parameters.
             */
            export type JSONSchemaArray = {
                type: 'array'
                items: LLMToolProperty
                description?: string
            }

            /**
             * Response body from the LLM API.
             */
            export type LLMResponseBody = LLMChatCompletionResponse

            /**
             * Individual choice in the LLM response.
             */
            export type LLMChatCompletionResponseChoice = {
                message: LLMMessagePayload
                finish_reason: string
                index: number
                logprobs?: number | null
            }

            /**
             * Complete response from the LLM API.
             */
            export type LLMChatCompletionResponse = {
                id: string
                object: string
                created: number
                model: string
                choices: LLMChatCompletionResponseChoice[]
                usage: {
                    queue_time?: number
                    prompt_tokens?: number
                    prompt_time?: number
                    completion_tokens?: number
                    completion_time?: number
                    total_tokens?: number
                    total_time?: number
                }
                system_fingerprint?: string
                x_groq?: { id: string }
            }
        }
    }

    export interface IConfigManager {
        /**
         * Retrieves the value associated with the specified configuration key.
         * Returns undefined if the key does not exist.
         *
         * @param key - The configuration key to retrieve.
         * @returns The value associated with the key or undefined if it does not exist.
         */
        get<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(
            key: K
        ): Kimiko.Types.Groq_LLM.LLMRequestBody[K] | undefined

        /**
         * Retrieves the entire configuration as an object.
         *
         * @returns The full configuration object.
         */
        getAll(): Kimiko.Types.Groq_LLM.LLMRequestBody

        /**
         * Sets the value for the specified configuration key.
         * Overwrites the existing value if the key already exists.
         *
         * @param key - The configuration key to update or add.
         * @param value - The value to associate with the key.
         */
        set<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(
            key: K,
            value: Kimiko.Types.Groq_LLM.LLMRequestBody[K]
        ): void

        /**
         * Checks if a specific configuration key exists in the configuration.
         *
         * @param key - The configuration key to check.
         * @returns True if the key exists, otherwise false.
         */
        has<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(
            key: K
        ): boolean

        /**
         * Deletes the specified configuration key from the configuration.
         *
         * @param key - The configuration key to remove.
         * @returns True if the key was successfully removed, otherwise false.
         */
        delete<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(
            key: K
        ): boolean

        /**
         * Locks the configuration to prevent further modifications.
         * After locking, attempts to set or delete keys will fail.
         */
        lock(): void

        /**
         * Checks if the configuration is currently locked.
         *
         * @returns True if the configuration is locked, otherwise false.
         */
        isLocked(): boolean
    }

    export interface IContextManager {
        /**
         * Retrieves all messages currently stored in the context.
         *
         * @returns An array of all messages in the context.
         */
        get(): Kimiko.Types.Groq_LLM.LLMMessagePayload[]

        /**
         * Replaces the current set of messages in the context with a new set.
         *
         * @param messages - An array of messages to set as the context.
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        set(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): {
            success: boolean
            errors?: string[]
        }

        /**
         * Adds a message to the end of the context.
         *
         * @param message - The message to append to the context.
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        append(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): {
            success: boolean
            errors?: string[]
        }

        /**
         * Adds a message to the beginning of the context.
         *
         * @param message - The message to prepend to the context.
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        prepend(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): {
            success: boolean
            errors?: string[]
        }

        /**
         * Retrieves the total number of messages in the context.
         *
         * @returns The number of messages in the context.
         */
        count(): number

        /**
         * Checks whether the context currently contains any messages.
         *
         * @returns True if the context is empty, otherwise false.
         */
        isEmpty(): boolean

        /**
         * Retrieves the first message in the context.
         *
         * @returns The first message in the context, or undefined if the context is empty.
         */
        getFirst(): Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined

        /**
         * Retrieves the last message in the context.
         *
         * @returns The last message in the context, or undefined if the context is empty.
         */
        getLast(): Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined

        /**
         * Registers a callback function to be invoked whenever the context changes.
         *
         * @param callback - A function that is called with the updated list of messages.
         */
        onChange(
            callback: (
                messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]
            ) => void
        ): void

        /**
         * Clears all messages from the context.
         *
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        clear(): { success: boolean; errors?: string[] }

        /**
         * Locks the context to prevent any further modifications.
         *
         * @returns An object indicating success status and any errors if the operation fails.
         */
        lock(): { success: boolean; errors?: string[] }

        /**
         * Checks whether the context is currently locked.
         *
         * @returns True if the context is locked, otherwise false.
         */
        isLocked(): boolean
    }

    export interface IToolManager {
        /**
         * Registers a new tool in the tool manager.
         *
         * @param tool - The tool to register.
         * @param handler - The handler function for the tool.
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        register(
            tool: Kimiko.Types.Groq_LLM.LLMTool,
            handler: (
                message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload
            ) => Promise<Kimiko.Types.Groq_LLM.LLMToolMessagePayload> | Kimiko.Types.Groq_LLM.LLMToolMessagePayload | void
        ): { success: boolean; errors?: string[] }

        /**
         * Unregisters a tool from the tool manager.
         *
         * @param name - The name of the tool to unregister.
         * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
         */
        unregister(name: string): { success: boolean; errors?: string[] }

        /**
         * Retrieves all registered tools in the tool manager.
         *
         * @returns An array of all registered tools.
         */
        getAll(): Kimiko.Types.Groq_LLM.LLMTool[]

        /**
         * Retrieves a specific tool by its name.
         *
         * @param name - The name of the tool to retrieve.
         * @returns The tool if found, or undefined if it does not exist.
         */
        getByName(name: string): Kimiko.Types.Groq_LLM.LLMTool | undefined

        /**
         * Checks whether a tool with the specified name exists in the tool manager.
         *
         * @param name - The name of the tool to check.
         * @returns True if the tool exists, otherwise false.
         */
        has(name: string): boolean

        /**
         * Registers a callback function to be invoked whenever the tool manager changes.
         *
         * @param callback - A function that is called with the updated list of tools.
         */
        onChange(callback: (tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void): void

        /**
         * Checks whether the tool manager currently has any tools registered.
         *
         * @returns True if the tool manager is empty, otherwise false.
         */
        isEmpty(): boolean

        /**
         * Checks whether the tool manager is currently locked.
         *
         * @returns True if the manager is locked, otherwise false.
         */
        isLocked(): boolean

        /**
         * Locks the tool manager to prevent further modifications.
         *
         * @returns An object indicating success status and any errors if the operation fails.
         */
        lock(): { success: boolean; errors?: string[] }

        /**
         * Calls the handler function for a specific tool on a tool call message.
         *
         * @param message - The tool call message.
         */
        handleToolCall(message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload): Kimiko.Types.Groq_LLM.LLMToolMessagePayload
        
    }
    
    export interface IAgent {
        /**
         * Sends a message to the LLM and returns the response.
         * 
         * @param overrideConfig - Partial configuration to override the default configuration.
         * @returns The response from the LLM.
         */
        send(overrideConfig?: Partial<Kimiko.Types.Groq_LLM.LLMRequestBody>): Promise<Kimiko.Types.Groq_LLM.LLMChatCompletionResponse>;
    
        /**
         * Gets the configuration manager.
         * 
         * @returns The configuration manager.
         */
        getConfigManager(): Kimiko.IConfigManager;
    
        /**
         * Gets the context manager.
         * 
         * @returns The context manager.
         */
        getContextManager(): Kimiko.IContextManager;
    
        /**
         * Gets the tool manager.
         * 
         * @returns The tool manager.
         */
        getToolManager(): Kimiko.IToolManager;
    
        /**
         * Registers a callback function to be invoked whenever the agent processes a request.
         * @param callback - A function that is called with the updated request and response.
         * @returns A function that can be called to remove the callback.
         */
        onRequest(callback: (request: Kimiko.Types.Groq_LLM.LLMRequestBody, response: Kimiko.Types.Groq_LLM.LLMChatCompletionResponse) => void): () => void;
    
        /**
         * Handles tool calls
         * @param {Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload} message
         * @returns {Promise<Kimiko.Types.Groq_LLM.LLMChatCompletionResponse>}
         */
        handleToolCalls(message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload): Promise<Kimiko.Types.Groq_LLM.LLMChatCompletionResponse>
    }
    export interface IKimikoEmitter {
        on(event: string, listener: (...args: any[]) => void): this
        emit(event: string, ...args: any[]): boolean
    }

    export const Agent = KimikoAgent
    export const Client = new KimikoClient()
    export const ConfigManager = KimikoConfigManager
    export const ContextManager = KimikoContextManager
    export const ToolManager = KimikoToolManager

    export const Utils = {
        convertDiscordMessageToLLMMessage: (message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload => {
            return {
                role: message.author.bot ? "assistant" : "user",
                content: message.content,
            };
        },
    }
}
