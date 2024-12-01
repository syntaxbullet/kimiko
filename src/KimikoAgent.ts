import { Message } from 'discord.js'
import { config as dotEnvConfig } from 'dotenv'

dotEnvConfig()

export type BaseAgent = {
    send: () => Promise<LLM.CompletionResponse>;
    addMessage: (message: LLM.ChoiceMessage | Message) => Promise<LLM.ChoiceMessage>;
    addToolResult: (result: { content: string , fnName: string, id: string }) => LLM.ChoiceMessage;
    convert: (message: Message) => LLM.ChoiceMessage;
}
export namespace LLM {
    export type Role = 'user' | 'assistant' | 'system' | 'tool'
    export interface ChoiceMessage {
        role: Role
        content: string
        tool_calls?: {
            id: string
            type: 'function'
            function: { name: string; arguments?: string }
        }[]
        tool_call_id?: string
        name?: string
    }
    export interface Choice {
        index: number
        message: ChoiceMessage
        logprobs: Record<string, number> | null
        finish_reason: string
    }
    export interface Usage {
        queue_time: number
        prompt_tokens: number
        prompt_time: number
        completion_tokens: number
        completion_time: number
        total_tokens: number
        total_time: number
    }
    export interface XGroq {
        id: string
    }
    export interface CompletionResponse {
        id: string
        object: string
        created: number
        model: string
        choices: Choice[]
        usage: Usage
        system_fingerprint?: string
        x_groq?: XGroq
    }
    export interface RequestPayload {
        baseURL?: string
        frequency_penalty?: number | null
        logit_bias?: Record<string, number> | null
        logprobs?: boolean | null
        max_tokens?: number | null
        messages: ChoiceMessage[]
        model: string
        n?: number | null
        parallel_tool_calls?: boolean | null
        presence_penalty?: number | null
        response_format?: { type: 'json_object' } | null
        seed?: number | null
        stop?: string | Array<string> | null
        stream?: boolean | null
        stream_options?: { include_usage?: boolean } | null
        temperature?: number | null
        tool_choice?: { function?: { name: string }; type?: 'function' } | null
        tools?:
            | {
                  function?: {
                      description?: string
                      name?: string
                      parameters?: Record<string, any>
                  }
                  type: 'function'
              }[]
            | null
        top_logprobs?: number | null
        top_p?: number | null
        user?: 'kimiko_discord_bot' | string | null
    }
}

class KimikoAgentConfig {
    public baseURL?: string
    public frequency_penalty?: number | null
    public logit_bias?: Record<string, number> | null
    public logprobs?: boolean | null
    public max_tokens?: number | null
    public n?: number | null
    public parallel_tool_calls?: boolean | null
    public presence_penalty?: number | null
    public response_format?: { type: 'json_object' } | null
    public seed?: number | null
    public stop?: string | string[] | null
    public stream?: boolean | null
    public stream_options?: { include_usage?: boolean } | null
    public temperature?: number | null
    public tool_choice?: {
        function?: { name: string }
        type?: 'function'
    } | null
    public tools?:
        | {
              function?: {
                  description?: string
                  name?: string
                  parameters?: Record<string, any>
              }
              type: 'function'
          }[]
        | null
    public top_logprobs?: number | null
    public top_p?: number | null
    public user?: string | null

    public withBaseURL(baseURL: string): KimikoAgentConfig {
        this.baseURL = baseURL
        return this
    }

    public withFrequencyPenalty(
        frequency_penalty: number | null
    ): KimikoAgentConfig {
        this.frequency_penalty = frequency_penalty
        return this
    }

    public withLogitBias(
        logit_bias: Record<string, number> | null
    ): KimikoAgentConfig {
        this.logit_bias = logit_bias
        return this
    }

    public withLogprobs(logprobs: boolean | null): KimikoAgentConfig {
        this.logprobs = logprobs
        return this
    }

    public withMaxTokens(max_tokens: number | null): KimikoAgentConfig {
        this.max_tokens = max_tokens
        return this
    }

    public withN(n: number | null): KimikoAgentConfig {
        this.n = n
        return this
    }

    public withParallelToolCalls(
        parallel_tool_calls: boolean | null
    ): KimikoAgentConfig {
        this.parallel_tool_calls = parallel_tool_calls
        return this
    }

    public withPresencePenalty(
        presence_penalty: number | null
    ): KimikoAgentConfig {
        this.presence_penalty = presence_penalty
        return this
    }

    public withResponseFormat(
        response_format: { type: 'json_object' } | null
    ): KimikoAgentConfig {
        this.response_format = response_format
        return this
    }

    public withSeed(seed: number | null): KimikoAgentConfig {
        this.seed = seed
        return this
    }

    public withStop(stop: string | string[] | null): KimikoAgentConfig {
        this.stop = stop
        return this
    }

    public withStream(stream: boolean | null): KimikoAgentConfig {
        this.stream = stream
        return this
    }

    public withStreamOptions(
        stream_options: { include_usage?: boolean } | null
    ): KimikoAgentConfig {
        this.stream_options = stream_options
        return this
    }

    public withTemperature(temperature: number | null): KimikoAgentConfig {
        this.temperature = temperature
        return this
    }

    public withToolChoice(
        tool_choice: { function?: { name: string }; type?: 'function' } | null
    ): KimikoAgentConfig {
        this.tool_choice = tool_choice
        return this
    }

    public withTools(
        tools:
            | {
                  function?: {
                      description?: string
                      name?: string
                      parameters?: Record<string, any>
                  }
                  type: 'function'
              }[]
            | null
    ): KimikoAgentConfig {
        this.tools = tools
        return this
    }

    public withTopLogprobs(top_logprobs: number | null): KimikoAgentConfig {
        this.top_logprobs = top_logprobs
        return this
    }

    public withTopP(top_p: number | null): KimikoAgentConfig {
        this.top_p = top_p
        return this
    }

    public withUser(user: string | null): KimikoAgentConfig {
        this.user = user
        return this
    }
}

export class KimikoAgentBuilder {
    public messages: LLM.ChoiceMessage[]
    public model: string
    public config: KimikoAgentConfig

    constructor(messages: LLM.ChoiceMessage[], model: string) {
        this.messages = messages
        this.model = model
        this.config = new KimikoAgentConfig()
    }

    public build(): BaseAgent {
        if (!this.messages) {
            throw new Error(
                'Required field missing: messages must be set before building.'
            )
        }
        if (!this.model) {
            throw new Error(
                'Required field missing: model must be set before building.'
            )
        }

        const payload: LLM.RequestPayload = {
            ...this.config,
            messages: this.messages,
            model: this.model,
        }

        return {
            send: async (): Promise<LLM.CompletionResponse> => {
                if (!this.config.baseURL) {
                    throw new Error('Base URL must be set to send the request.')
                }
               delete payload.baseURL
                try {
                    const response = await fetch(this.config.baseURL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        },
                        body: JSON.stringify(payload),
                    })
                    if (!response.ok) {
                        throw new Error(
                            `HTTP error! status: ${response.status}, payload: ${JSON.stringify(payload)}, endpoint: ${this.config.baseURL}`
                        )
                    }
                    return await response.json()
                } catch (error: any) {
                    throw new Error(
                        `Failed to send request: ${error.message}`
                    )
                }
            },
            addMessage: async (
                message: LLM.ChoiceMessage | Message
            ): Promise<LLM.ChoiceMessage> => {
                if ('id' in message) {
                    // discord message
                    const role: LLM.Role = message.author.bot
                        ? 'assistant'
                        : 'user'
                    message = { role, content: message.content }
                }
                this.messages.push(message)
                return message
            },
            addToolResult: (result: { content: string , fnName: string, id: string }): LLM.ChoiceMessage => {
                this.messages.push({ role: "tool", content: result.content, tool_call_id: result.id, name: result.fnName })
                return { role: "tool", content: result.content, tool_call_id: result.id, name: result.fnName }
            },
            convert: (message: Message): LLM.ChoiceMessage => {
                const role: LLM.Role = message.author.bot ? 'assistant' : 'user'
                return { role, content: message.content }
            },
        }
    }
}
