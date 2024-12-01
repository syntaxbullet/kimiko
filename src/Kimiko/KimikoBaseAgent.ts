import { Message } from 'discord.js'
import { config as dotEnvConfig } from 'dotenv'
import { Kimiko } from '.'
dotEnvConfig()

/**
 * Base implementation of the Kimiko agent interface.
 * Handles core functionality such as message management, configuration, and API communication.
 */
export class BaseAgent implements Kimiko.Types.IKimikoAgent {

    private config: Kimiko.Types.Groq_LLM.LLMRequestBody
    private baseURL: string =
        process.env.LLM_API_BASE_URL ||
        'https://api.groq.com/openai/v1/chat/completions'

    /**
     * Creates a new BaseAgent instance.
     * @param config - Initial configuration for the agent
     * @throws Error if model is not specified in config
     */
    constructor(config: Kimiko.Types.Groq_LLM.LLMRequestBody) {
        if (!config.model) {
            throw new Error('Model is required in the config')
        }

        this.config = { ...config }
    }

    /**
     * Adds a message to the conversation history.
     * If a Discord message is provided, it will be converted to LLM format.
     * @param message - The message to add, either an LLM message or a Discord message
     */
    addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload | Message) {
        if (message instanceof Message) {
            this.config.messages.push(this.convertDiscordMessage(message))
        } else {
            this.config.messages.push(message)
        }
    }

    /**
     * Converts a Discord message to LLM message format.
     * Sets the role based on whether the author is a bot.
     * @param message - The Discord message to convert
     * @returns The converted LLM message
     */
    convertDiscordMessage(message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        return {
            role: message.author.bot ? 'assistant' : 'user',
            content: message.content,
            name: message.author.username,
        }
    }

    /**
     * Gets all messages in the current conversation history.
     * @returns A copy of the messages array
     */
    getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return [...this.config.messages]
    }

    /**
     * Sets the conversation history messages.
     * @param messages - Array of LLM messages to set
     */
    setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]) {
        this.config.messages = messages
    }

    /**
     * Gets the current LLM configuration.
     * @returns A copy of the current configuration
     */
    getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return { ...this.config }
    }

    /**
     * Sets the LLM configuration.
     * @param config - The configuration to set
     */
    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody) {
        this.config = config
    }

    /**
     * Sets the base URL for the LLM API.
     * @param url - The base URL to set
     */
    setBaseURL(url: string) {
        this.baseURL = url
    }

    /**
     * Gets the base URL for the LLM API.
     * @returns The current base URL
     */
    getBaseURL(): string {
        return this.baseURL
    }

    /**
     * Sends the current conversation to the LLM for processing.
     * @returns A promise that resolves to the LLM's response
     * @throws Error if messages are missing or if the API request fails
     */
    async send(): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        const payload = this.getConfig();
        if (!payload.messages) {
            throw new Error('Messages are required in the payload')
        }
        try {
            const response = await fetch(this.getBaseURL(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.LLM_API_KEY}`,
                },
                body: JSON.stringify(payload),
            })
            if (!response.ok) {
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${response.statusText}`
                )
            }
            const responseBody =
                (await response.json()) as Kimiko.Types.Groq_LLM.LLMResponseBody
            return responseBody
        } catch (error: any) {
            throw new Error(`Failed to send request: ${error.message}`)
        }
    }
}
