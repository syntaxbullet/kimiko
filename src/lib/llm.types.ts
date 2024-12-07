/**
 * Configuration for an  request.
 * Includes all possible parameters that can be sent to the Groq API.
 */
export type RequestBody = {
    frequency_penalty?: number
    logit_bias?: { [key: string]: number }
    logprobs?: boolean
    max_tokens?: number
    messages: MessagePayload[]
    model: string
    n?: number
    parallel_tool_calls?: boolean
    presence_penalty?: number
    reponse_format?: ResponseFormat
    seed?: number
    stop?: string[]
    stream?: false // support only false
    stream_options?: StreamOptions
    temperature?: number
    tool_choice?: ToolChoice
    tools?: Tool[]
    top_logprobs?: number
    top_p?: number
    user?: string
}

/**
 * Union type for all possible message payloads in the conversation.
 */
export type MessagePayload =
    | SystemMessagePayload
    | UserMessagePayload
    | AssistantMessagePayload
    | ToolMessagePayload

/**
 * System message in the conversation.
 * Used for setting context and behavior instructions.
 */
export type SystemMessagePayload = {
    role: 'system'
    content: string
    name?: string
}

/**
 * User message in the conversation.
 */
export type UserMessagePayload = {
    role: 'user'
    content: string
    name?: string
}

/**
 * Assistant (bot) message in the conversation.
 * May include tool calls if the assistant used any tools.
 */
export type AssistantMessagePayload = {
    role: 'assistant'
    content: string
    name?: string
    tool_calls?: ToolCall[]
}

/**
 * Tool response message in the conversation.
 */
export type ToolMessagePayload = {
    role: 'tool'
    content: string
    tool_call_id: string
}

/**
 * Response format specification for the .
 */
export type ResponseFormat = { type: 'json_object' }

/**
 * Stream options for the  request.
 */
export type StreamOptions = { include_usage: boolean } | null

/**
 * Tool choice specification for the .
 */
export type ToolChoice =
    | string
    | { function: { name: string }; type: 'function' }

/**
 * Tool call made by the assistant.
 */
export type ToolCall = {
    function: { name: string; arguments: string }
    type: 'function'
    id: string
}

/**
 * Tool definition that can be used by the assistant.
 */
export type Tool = {
    function: {
        description: string
        name: string
        parameters?: ToolParameters
    }
    type: 'function'
}

/**
 * Parameters definition for a tool.
 */
export type ToolParameters = {
    type: 'object'
    properties: { [key: string]: ToolProperty }
    required?: string[]
    additionalProperties?: boolean
}

/**
 * Union type for all possible tool parameter types.
 */
export type ToolProperty =
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
export type JSONSchemaObject = ToolParameters

/**
 * Array parameter type for tool parameters.
 */
export type JSONSchemaArray = {
    type: 'array'
    items: ToolProperty
    description?: string
}

/**
 * Response body from the  API.
 */
export type ResponseBody = ChatCompletionResponse

/**
 * Individual choice in the  response.
 */
export type ChatCompletionResponseChoice = {
    message: MessagePayload
    finish_reason: string
    index: number
    logprobs?: number | null
}

/**
 * Complete response from the  API.
 */
export type ChatCompletionResponse = {
    id: string
    object: string
    created: number
    model: string
    choices: ChatCompletionResponseChoice[]
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
