import { Message } from 'discord.js'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()
/**
 * Represents the role of a message sender.
 */
export type Role = 'user' | 'assistant' | 'system'

/**
 * Interface for the message within each choice.
 */
export interface ChoiceMessage {
    /** The role of the message sender. */
    role: Role
    /** The content of the message. */
    content: string

    /** tool calls */
    tool_calls?: {
        id: string
        type: 'function'
        function: { name: string; arguments?: string }
    }[]
}

/**
 * Interface for each choice in the choices array.
 */
export interface Choice {
    /** The index of the choice. */
    index: number
    /** The message associated with the choice. */
    message: ChoiceMessage
    /** Log probabilities for tokens, if available. */
    logprobs: Record<string, number> | null
    /** The reason why the completion finished. */
    finish_reason: string
}

/**
 * Interface for the usage object detailing token and time metrics.
 */
export interface Usage {
    /** Time spent in the queue before processing. */
    queue_time: number
    /** Number of tokens in the prompt. */
    prompt_tokens: number
    /** Time spent processing the prompt. */
    prompt_time: number
    /** Number of tokens generated in the completion. */
    completion_tokens: number
    /** Time spent generating the completion. */
    completion_time: number
    /** Total number of tokens used. */
    total_tokens: number
    /** Total time taken for the request. */
    total_time: number
}

/**
 * Interface for the x_groq object.
 */
export interface XGroq {
    /** The unique identifier for the Groq request. */
    id: string
}

/**
 * Main interface for the completion response from the API.
 */
export interface CompletionResponse {
    /** The unique identifier for the response. */
    id: string
    /** The type of object returned. */
    object: string
    /** Timestamp of creation. */
    created: number
    /** The model used for generating the completion. */
    model: string
    /** Array of choices returned by the API. */
    choices: Choice[]
    /** Usage metrics for the request. */
    usage: Usage
    /** Optional system fingerprint for the request. */
    system_fingerprint?: string
    /** Optional Groq-specific metadata. */
    x_groq?: XGroq
}

/**
 * Interface representing the payload for LLM requests.
 */
export interface LLMRequestPayload {
    /** Base URL for the API endpoint. */
    baseURL?: string
    /** Frequency penalty applied during generation. */
    frequency_penalty?: number | null
    /** Biases for specific tokens. */
    logit_bias?: Record<string, number> | null
    /** Whether to return log probabilities. */
    logprobs?: boolean | null
    /** Maximum number of tokens to generate. */
    max_tokens?: number | null
    /** Array of messages forming the conversation context. */
    messages?: ChoiceMessage[]
    /** The model to use for generation. */
    model?: string
    /** Number of completions to generate. */
    n?: number | null
    /** Whether to allow parallel tool calls. */
    parallel_tool_calls?: boolean | null
    /** Presence penalty applied during generation. */
    presence_penalty?: number | null
    /** Format of the response. Allows usage of JSON mode. */
    response_format?: { type: 'json_object' } | null
    /** Seed for random number generation to ensure determinism. */
    seed?: number | null
    /** Tokens at which to stop generation. */
    stop?: string | Array<string> | null
    /** Whether to stream the response. */
    stream?: boolean | null
    /** Options for streaming responses. */
    stream_options?: { include_usage?: boolean } | null
    /** Temperature for sampling during generation. */
    temperature?: number | null
    /** Choice of tool to use, if any. */
    tool_choice?: { function?: { name: string }; type?: 'function' } | null
    /** Array of tools to be used in the generation process. */
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
    /** Number of top log probabilities to consider. */
    top_logprobs?: number | null
    /** Cumulative probability threshold for nucleus sampling. */
    top_p?: number | null
    /** Identifier for the user making the request. */
    user?: 'kimiko_discord_bot' | string | null
}

/**
 * Class representing the KimikoAgent, responsible for interacting with the LLM API.
 */
export class KimikoAgent {
    /**
     * The maximum number of tokens the model's context can hold.
     * @private
     */
    private contextLength: number = 8192

    /**
     * The threshold for summarizing messages, starting with the oldest.
     * @private
     */
    private summaryThreshold: number = 10

    /**
     * The current context of the conversation.
     * @private
     */
    private context: ChoiceMessage[] = []

    /**
     * Creates an instance of KimikoAgent.
     * @throws Will throw an error if the GROQ_API_KEY environment variable is not set.
     */
    constructor(private systemPrompt: string) {
        if (!process.env.GROQ_API_KEY)
            throw new Error('KimikoAgent - Groq API_KEY_NOT_PROVIDED')
        // Initialize context with the system prompt
        this.context.push({
            role: 'system',
            content: this.systemPrompt,
        })
    }
    /**
     * Retrieves the current estimated token count of the context.
     * @returns The total estimated number of tokens.
     */
    public getCurrentTokenCount(): number {
        return this.estimateTokenUsage(this.context)
    }
    /**
     * Adds a new message to the context and ensures the context limit is maintained.
     * @param message - The Discord message to add to the context.
     */
    public async addMessage(message: Message): Promise<void> {
        const choiceMessage = this.convertMessage(message)
        this.context.push(choiceMessage)
        await this.ensureContextLimit()
    }

    /**
     * Ensures that the context does not exceed the maximum token limit.
     * If it does, summarizes the oldest messages based on the summaryThreshold.
     */
    private async ensureContextLimit(): Promise<void> {
        let currentTokenCount = this.estimateTokenUsage(this.context)

        while (currentTokenCount > this.contextLength) {
            // Determine the number of messages to summarize
            const messagesToSummarize = this.context.slice(
                1,
                1 + this.summaryThreshold
            ) // Exclude system prompt
            if (messagesToSummarize.length === 0) {
                throw new Error(
                    'KimikoAgent - Unable to summarize further. Context limit too small.'
                )
            }

            // Create a summary of the selected messages
            const summaryMessage =
                await this.createSummaryMessage(messagesToSummarize)

            // Remove the original messages and add the summary
            this.context.splice(1, messagesToSummarize.length, summaryMessage)

            // Recalculate the token count after summarization
            currentTokenCount = this.estimateTokenUsage(this.context)
        }
    }

    /**
     * Creates a summary of the provided messages using the LLM API.
     * @param messages - The array of ChoiceMessage objects to summarize.
     * @returns A ChoiceMessage containing the summary.
     */
    private async createSummaryMessage(
        messages: ChoiceMessage[]
    ): Promise<ChoiceMessage> {
        // Define the summary prompt
        console.log(`Summarizing...`)
        const summaryPrompt = `Summarize the following conversation concisely:\n\n${messages.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}`

        // Create a temporary payload for summarization
        const summaryPayload: LLMRequestPayload = {
            messages: [
                {
                    role: 'user',
                    content: summaryPrompt,
                },
            ],
            max_tokens: 500, // Adjust as needed
            temperature: 0.3, // Lower temperature for more deterministic summaries
        }

        // Send the summarization request
        const response = await this.sendCompletion(summaryPayload, messages)

        // Extract the summary from the response
        if (response.choices && response.choices.length > 0) {
            const summaryContent = response.choices[0].message.content
            return {
                role: 'assistant',
                content: `<Summary>${summaryContent}</Summary>`,
            }
        } else {
            throw new Error(
                'KimikoAgent - Summarization failed: No summary returned.'
            )
        }
    }

    /**
     * Converts a Discord message object to an OpenAI-compatible message payload.
     * @param message - The Discord message to convert.
     * @returns A `ChoiceMessage` object representing the converted message.
     */
    private convertMessage(message: Message): ChoiceMessage {
        return {
            role: message.author.bot ? 'assistant' : 'user',
            content: message.content,
        }
    }

    /**
     * Sends a completion request to the LLM API.
     * @param context? - The conversation context as an array of `ChoiceMessage`.
     * @param requestPayload - Optional payload to customize the request.
     * @returns A promise that resolves to a `CompletionResponse`.
     * @throws Will throw an error if the API request fails.
     */
    public async sendCompletion(
        requestPayload?: LLMRequestPayload,
        context?: ChoiceMessage[]
    ): Promise<CompletionResponse> {
        const requestURL =
            requestPayload?.baseURL ||
            'https://api.groq.com/openai/v1/chat/completions'

        const response = await fetch(requestURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: requestPayload?.model ?? 'llama-3.1-70b-specdec',
                messages: requestPayload?.messages ?? context ?? this.context,
                temperature: requestPayload?.temperature ?? 0.1,
                max_tokens: requestPayload?.max_tokens ?? 1000,
                ...requestPayload,
            }),
        })

        if (!response.ok) {
            const errorDetails = await response.text()
            throw new Error(
                `Error: ${response.status} - ${response.statusText} - ${errorDetails}`
            )
        }

        return await response.json()
    }

    /**
     * Estimates the number of tokens used in an array of ChoiceMessages.
     *
     * This method concatenates the content of all messages using a tilde ("~") as a separator,
     * splits the resulting string into words based on spaces, and multiplies the word count by 4
     * to provide an estimated token usage. This is a simple approximation and does not account
     * for subword tokens or other tokenization nuances specific to language models.
     *
     * @param {ChoiceMessage[]} messages - An array of ChoiceMessage objects representing the conversation.
     * @returns {number} The estimated total number of tokens.
     */
    private estimateTokenUsage(messages: ChoiceMessage[]): number {
        const text = messages.map((message) => message.content).join('~')
        const words = text.split(' ')
        return words.length * 4
    }
}
