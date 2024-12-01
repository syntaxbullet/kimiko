import { Kimiko } from "../../";
import { Message } from "discord.js";

/**
 * A decorator that maintains a sliding window of messages in the conversation history.
 * When the number of messages exceeds the window size, older messages are removed.
 */
export class SlidingWindowDecorator implements Kimiko.Types.IKimikoAgent {

    private readonly _agent: Kimiko.Types.IKimikoAgent;
    private readonly _windowSize: number;

    /**
     * Creates a new SlidingWindowDecorator instance.
     * @param agent - The base agent to decorate
     * @param windowSize - Maximum number of messages to keep in history
     */
    constructor(agent: Kimiko.Types.IKimikoAgent, windowSize: number) {
        this._agent = agent;
        this._windowSize = windowSize;
    }

    /**
     * Sends the current conversation to the LLM for processing.
     * @returns A promise that resolves to the LLM's response
     */
    async send(): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        const messages = this._agent.getMessages();
        const systemMessage = messages.find(m => m.role === 'system');
        const recentMessages = messages
            .filter(m => m.role !== 'system')
            .slice(-this._windowSize);
        
        if (systemMessage) {
            this._agent.setMessages([systemMessage, ...recentMessages]);
        } else {
            this._agent.setMessages(recentMessages);
        }
        
        return this._agent.send();
    }

    /**
     * Adds a new message to the conversation history.
     * If the number of messages exceeds the window size, the oldest message is removed.
     * @param message - The message to add, either an LLM message or a Discord message
     */
    addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload | Message): void {
        if (this._agent.getMessages().length >= this._windowSize) {
            this._agent.getMessages().shift();
        }
        this._agent.addMessage(message);
    }

    /**
     * Gets all messages in the current conversation history.
     * @returns Array of LLM messages
     */
    getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this._agent.getMessages();
    }

    /**
     * Sets the conversation history messages.
     * Preserves the system message and enforces the sliding window size.
     * @param messages - Array of LLM messages to set
     */
    setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): void {
        const systemMessage = messages.find(m => m.role === 'system');
        const nonSystemMessages = messages
            .filter(m => m.role !== 'system')
            .slice(-this._windowSize);

        if (systemMessage) {
            this._agent.setMessages([systemMessage, ...nonSystemMessages]);
        } else {
            // Preserve existing system message if available
            const existingSystemMessage = this._agent.getMessages().find(m => m.role === 'system');
            if (existingSystemMessage) {
                this._agent.setMessages([existingSystemMessage, ...nonSystemMessages]);
            } else {
                this._agent.setMessages(nonSystemMessages);
            }
        }
    }

    /**
     * Gets the current LLM configuration.
     * @returns The LLM request configuration
     */
    getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this._agent.getConfig();
    }

    /**
     * Sets the LLM configuration.
     * @param config - The LLM request configuration to set
     */
    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): void {
        this._agent.setConfig(config);
    }

    /**
     * Gets the base URL for the LLM API.
     * @returns The base URL string
     */
    getBaseURL(): string {
        return this._agent.getBaseURL();
    }

    /**
     * Sets the base URL for the LLM API.
     * @param url - The base URL to set
     */
    setBaseURL(url: string): void {
        this._agent.setBaseURL(url);
    }

    /**
     * Converts a Discord message to an LLM message format.
     * @param message - The Discord message to convert
     * @returns The converted LLM message
     */
    convertDiscordMessage(message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        return this._agent.convertDiscordMessage(message);
    }
}
