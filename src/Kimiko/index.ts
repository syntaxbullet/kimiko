import { Message } from 'discord.js'
import { ToolAgentDecorator } from './Decorators/ToolAgentDecorator'
import { LoggingAgentDecorator } from './Decorators/LoggingAgentDecorator'
import { SlidingWindowDecorator } from './Decorators/Context/SlidingWindow'
import { KimikoClient as Client } from './KimikoClient'
import { BaseAgent } from './KimikoBaseAgent'

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
            export type JSONSchemaString = { type: 'string'; enum?: string[] }

            /**
             * Number parameter type for tool parameters.
             */
            export type JSONSchemaNumber = {
                type: 'number' | 'integer'
                enum?: number[]
            }

            /**
             * Boolean parameter type for tool parameters.
             */
            export type JSONSchemaBoolean = { type: 'boolean' }

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

        /**
         * Core interface for Kimiko agents.
         * Defines the required methods for any agent implementation.
         */
        export interface IKimikoAgent {
            addMessage(message: Groq_LLM.LLMMessagePayload | Message): void
            getMessages(): Groq_LLM.LLMMessagePayload[]
            setMessages(messages: Groq_LLM.LLMMessagePayload[]): void
            getConfig(): Groq_LLM.LLMRequestBody
            setConfig(config: Groq_LLM.LLMRequestBody): void
            getBaseURL(): string
            setBaseURL(url: string): void
            convertDiscordMessage(message: Message): Groq_LLM.LLMMessagePayload
            send(): Promise<Groq_LLM.LLMResponseBody>
        }
    }

    /**
     * Contains decorator implementations for extending agent functionality.
     */
    export namespace Decorators {
        export const ToolAgent = ToolAgentDecorator
        export const LoggingAgent = LoggingAgentDecorator

        /**
         * Contains context-related decorators for managing conversation context.
         */
        export namespace Context {
            export const SlidingWindow = SlidingWindowDecorator
        }
    }
    export const KimikoClient = Client
    export const KimikoAgent = BaseAgent
}
