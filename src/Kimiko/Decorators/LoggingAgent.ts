import { Kimiko } from "..";
import { Message } from "discord.js";

/**
 * A decorator that adds console logging to agent operations.
 * Logs various agent activities such as message handling, configuration changes, and API calls.
 */
export class LoggingAgentDecorator implements Kimiko.Types.IKimikoAgent {

    private agent: Kimiko.Types.IKimikoAgent;

    /**
     * Creates a new LoggingAgentDecorator instance.
     * @param agent - The base agent to decorate with logging functionality
     */
    constructor(agent: Kimiko.Types.IKimikoAgent) {
        this.agent = agent;
    }

    /**
     * Adds a message to the conversation history and logs it.
     * @param message - The message to add, either an LLM message or a Discord message
     */
    addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload | Message): void {
        console.log("Adding message:", message.content);
        this.agent.addMessage(message);
    }

    /**
     * Gets all messages in the current conversation history.
     * @returns Array of LLM messages
     */
    getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this.agent.getMessages();
    }

    /**
     * Sets the conversation history messages and logs them.
     * @param messages - Array of LLM messages to set
     */
    setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): void {
        console.log("Setting messages:", messages);
        this.agent.setMessages(messages);
    }

    /**
     * Gets the current LLM configuration.
     * @returns The LLM request configuration
     */
    getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this.agent.getConfig();
    }

    /**
     * Sets the LLM configuration.
     * @param config - The LLM request configuration to set
     */
    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): void {
        this.agent.setConfig(config);
    }

    /**
     * Gets the base URL for the LLM API.
     * @returns The base URL string
     */
    getBaseURL(): string {
        return this.agent.getBaseURL();
    }

    /**
     * Sets the base URL for the LLM API.
     * @param url - The base URL to set
     */
    setBaseURL(url: string): void {
        this.agent.setBaseURL(url);
    }

    /**
     * Converts a Discord message to an LLM message format and logs the conversion.
     * @param message - The Discord message to convert
     * @returns The converted LLM message
     */
    convertDiscordMessage(message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        console.log("Converting message:", message);
        return this.agent.convertDiscordMessage(message);
    }

    /**
     * Sends the current conversation to the LLM for processing and logs the request and response.
     * @returns A promise that resolves to the LLM's response
     */
    async send(): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        console.log("Sending request...", this.agent.getConfig());
        const response = await this.agent.send();
        console.log("Response:", response);
        return response;
    }
}