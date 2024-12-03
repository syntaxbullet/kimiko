import { Message } from 'discord.js'
import { LoggingDecorator as Logging } from './Decorators/LoggingDecorator'
import { KimikoClient } from './KimikoClient'
import { KimikoAgent } from './KimikoAgent'

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

        /**
         * Contains decorator implementations for extending agent functionality
         */
        export namespace Decorators {
            export const LoggingDecorator = Logging
        }

        export interface IKimikoAgent {
            getMessages(): Groq_LLM.LLMMessagePayload[]
            addMessage(message: Groq_LLM.LLMMessagePayload): Groq_LLM.LLMMessagePayload[]
            setMessages(messages: Groq_LLM.LLMMessagePayload[]): Groq_LLM.LLMMessagePayload[]
            getTools(): Groq_LLM.LLMTool[]
            addTool(tool: Groq_LLM.LLMTool): Groq_LLM.LLMTool[]
            setTools(tools: Groq_LLM.LLMTool[]): Groq_LLM.LLMTool[]
            getConfig(): Groq_LLM.LLMRequestBody
            setConfig(config: Groq_LLM.LLMRequestBody): Groq_LLM.LLMRequestBody
            addConfig<K extends keyof Groq_LLM.LLMRequestBody>(key: K, value: Groq_LLM.LLMRequestBody[K]): Groq_LLM.LLMRequestBody
            send(configOverrride?: Groq_LLM.LLMRequestBody): Promise<Groq_LLM.LLMResponseBody>
            process(message: Groq_LLM.LLMMessagePayload): { done: boolean; message: Groq_LLM.LLMMessagePayload }
        }
    }
    export const Client = KimikoClient
    export const Agent = KimikoAgent
}
