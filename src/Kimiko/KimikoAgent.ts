import { Message } from "discord.js";
import { Kimiko } from ".";
import { config as dotEnvConfig } from 'dotenv';

dotEnvConfig();
const systemMessage: Kimiko.Types.Groq_LLM.LLMSystemMessagePayload = {
    role: 'system',
    content: 'You are a helpful assistant.',
    name: 'system',
};

/**
 * KimikoAgent class implements the IKimikoAgent interface and handles LLM interactions
 * @class
 * @implements {Kimiko.Types.IKimikoAgent}
 */
export class KimikoAgent implements Kimiko.Types.IKimikoAgent {
    /** Configuration for LLM requests */
    private config: Kimiko.Types.Groq_LLM.LLMRequestBody;

    /** Base URL for the LLM API */
    private baseURL: string =
    process.env.LLM_API_BASE_URL ||
    'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Creates an instance of KimikoAgent
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} config - Configuration for the LLM
     * @throws {Error} When model is not specified in config
     */
    constructor(config: Kimiko.Types.Groq_LLM.LLMRequestBody) {
        if (!config.model) {
            throw new Error('Model is required in the config')
        }

        this.config = {...config, tools: config.tools ?? [], messages: config.messages ?? [systemMessage]};
    }

    /**
     * Converts a Discord message to LLM message format
     * @param {Message} message - Discord message to convert
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload} Converted message in LLM format
     * @private
     */
    private convertDiscordMessage(message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        return {
            role: message.author.bot ? 'assistant' : 'user',
            content: message.content,
            name: message.author.username,
        };
    }

    /**
     * Gets the base URL for the LLM API
     * @returns {string} The base URL
     * @private
     */
    private getBaseURL(): string {
        return this.baseURL;
    }

    /**
     * Processes a message
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message to process
     * @returns {{ done: boolean; message: Kimiko.Types.Groq_LLM.LLMMessagePayload }} Processing result
     */
    public process(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): { done: boolean; message: Kimiko.Types.Groq_LLM.LLMMessagePayload } {
        return { done: true, message };
    }

    /**
     * Sends the current conversation to the LLM for processing
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} [configOverrride] - Optional configuration override
     * @returns {Promise<Kimiko.Types.Groq_LLM.LLMResponseBody>} LLM's response
     * @throws {Error} If messages are missing or if the API request fails
     */
    async send(configOverrride?: Kimiko.Types.Groq_LLM.LLMRequestBody): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        const payload = configOverrride ?? this.getConfig();
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

    /**
     * Adds a message to the conversation
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message to add
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Updated messages array
     */
    public addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        this.config.messages.push(message);
        return this.config.messages;
    }

    /**
     * Sets the conversation messages
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} messages - Messages to set
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Updated messages array
     */
    public setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        this.config.messages = messages;
        return this.config.messages;
    }

    /**
     * Adds a tool to the LLM configuration
     * @param {Kimiko.Types.Groq_LLM.LLMTool} tool - Tool to add
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Updated tools array
     */
    public addTool(tool: Kimiko.Types.Groq_LLM.LLMTool): Kimiko.Types.Groq_LLM.LLMTool[] {
        this.config.tools!.push(tool);
        return this.config.tools!;
    }

    /**
     * Sets the LLM configuration
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} config - Configuration to set
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Updated configuration
     */
    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): Kimiko.Types.Groq_LLM.LLMRequestBody {
        this.config = config;
        return this.config;
    }

    /**
     * Sets the tools for the LLM
     * @param {Kimiko.Types.Groq_LLM.LLMTool[]} tools - Tools to set
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Updated tools array
     */
    public setTools(tools: Kimiko.Types.Groq_LLM.LLMTool[]): Kimiko.Types.Groq_LLM.LLMTool[] {
        this.config.tools = tools;
        return this.config.tools;
    }

    /**
     * Adds a configuration key-value pair
     * @template K
     * @param {K} key - Configuration key
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody[K]} value - Configuration value
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Updated configuration
     */
    public addConfig<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(key: K, value: Kimiko.Types.Groq_LLM.LLMRequestBody[K]): Kimiko.Types.Groq_LLM.LLMRequestBody {
        this.config = {...this.config, [key]: value};
        return this.config;
    }

    /**
     * Gets the current LLM configuration
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Current configuration
     */
    public getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this.config;
    }

    /**
     * Gets the current tools array
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Current tools
     */
    public getTools(): Kimiko.Types.Groq_LLM.LLMTool[] {
        return this.config.tools!;
    }

    /**
     * Gets the current messages array
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Current messages
     */
    public getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this.config.messages;
    }
}

/**
 * Creates a new KimikoAgent instance with default configuration
 * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} config - Configuration for the LLM
 * @returns {Kimiko.Types.IKimikoAgent} New KimikoAgent instance
 */
const baseAgent = new KimikoAgent({
    model: 'llama-3.1-70b-specdec',
    messages: [systemMessage],
    tools: [],
});

export default baseAgent;