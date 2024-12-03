import { Message } from "discord.js";
import { Kimiko } from "..";

/**
 * LoggingDecorator implements the Decorator pattern to add logging functionality to KimikoAgent
 * It wraps an existing IKimikoAgent instance and logs all method calls, their arguments, and return values
 * 
 * @example
 * ```typescript
 * const baseAgent = new KimikoAgent(config);
 * const loggingAgent = new Kimiko.Types.Decorators.LoggingDecorator(baseAgent);
 * 
 * // This will now log the method call and its result          
 * await loggingAgent.addTool(tool);
 * ```
 * 
 * @implements {Kimiko.Types.IKimikoAgent}
 */
export class LoggingDecorator implements Kimiko.Types.IKimikoAgent {
    /**
     * Creates a new LoggingDecorator instance
     * @param {Kimiko.Types.IKimikoAgent} agent - The agent instance to wrap with logging functionality
     */
    constructor(private agent: Kimiko.Types.IKimikoAgent) {}

    /**
     * Internal logging method that handles consistent log formatting
     * @param {string} methodName - Name of the method being logged
     * @param {any[]} args - Arguments passed to the method
     * @param {any} [result] - Optional result returned by the method
     * @private
     */
    private log(methodName: string, args: any[], result?: any) {
        console.log(`[KimikoAgent] Calling ${methodName} with args:`, args);
        if (result !== undefined) {
            console.log(`[KimikoAgent] ${methodName} returned:`, result);
        }
    }

    /**
     * Processes a message with logging
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message to process
     * @returns {{ done: boolean; message: Kimiko.Types.Groq_LLM.LLMMessagePayload }} Processing result
     */
    public process(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): { done: boolean; message: Kimiko.Types.Groq_LLM.LLMMessagePayload } {
        this.log('process', [message]);
        const result = this.agent.process(message);
        this.log('process', [message], result);
        return result;
    }

    /**
     * Sends a request to the LLM with logging
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} [configOverride] - Optional configuration override
     * @returns {Promise<Kimiko.Types.Groq_LLM.LLMResponseBody>} LLM response
     * @throws {Error} When the request fails
     */
    public async send(configOverride?: Kimiko.Types.Groq_LLM.LLMRequestBody): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        this.log('send', [configOverride]);
        try {
            const result = await this.agent.send(configOverride);
            this.log('send', [configOverride], result);
            return result;
        } catch (error) {
            console.error('[KimikoAgent] send failed:', error);
            throw error;
        }
    }

    /**
     * Adds a message to the conversation with logging
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message to add
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Updated messages array
     */
    public addMessage(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        this.log('addMessage', [message]);
        const result = this.agent.addMessage(message);
        this.log('addMessage', [message], result);
        return result;
    }

    /**
     * Sets the conversation messages with logging
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} messages - Messages to set
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Updated messages array
     */
    public setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        this.log('setMessages', [messages]);
        const result = this.agent.setMessages(messages);
        this.log('setMessages', [messages], result);
        return result;
    }

    /**
     * Adds a tool to the agent with logging
     * @param {Kimiko.Types.Groq_LLM.LLMTool} tool - Tool to add
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Updated tools array
     */
    public addTool(tool: Kimiko.Types.Groq_LLM.LLMTool): Kimiko.Types.Groq_LLM.LLMTool[] {
        this.log('addTool', [tool]);
        const result = this.agent.addTool(tool);
        this.log('addTool', [tool], result);
        return result;
    }

    /**
     * Sets the agent configuration with logging
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} config - Configuration to set
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Updated configuration
     */
    public setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): Kimiko.Types.Groq_LLM.LLMRequestBody {
        this.log('setConfig', [config]);
        const result = this.agent.setConfig(config);
        this.log('setConfig', [config], result);
        return result;
    }

    /**
     * Sets the agent tools with logging
     * @param {Kimiko.Types.Groq_LLM.LLMTool[]} tools - Tools to set
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Updated tools array
     */
    public setTools(tools: Kimiko.Types.Groq_LLM.LLMTool[]): Kimiko.Types.Groq_LLM.LLMTool[] {
        this.log('setTools', [tools]);
        const result = this.agent.setTools(tools);
        this.log('setTools', [tools], result);
        return result;
    }

    /**
     * Adds a configuration key-value pair with logging
     * @template K - Type of the configuration key
     * @param {K} key - Configuration key to add
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody[K]} value - Value for the configuration key
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Updated configuration
     */
    public addConfig<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(
        key: K,
        value: Kimiko.Types.Groq_LLM.LLMRequestBody[K]
    ): Kimiko.Types.Groq_LLM.LLMRequestBody {
        this.log('addConfig', [key, value]);
        const result = this.agent.addConfig(key, value);
        this.log('addConfig', [key, value], result);
        return result;
    }

    /**
     * Gets the current configuration with logging
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} Current configuration
     */
    public getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        this.log('getConfig', []);
        const result = this.agent.getConfig();
        this.log('getConfig', [], result);
        return result;
    }

    /**
     * Gets the current tools array with logging
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Current tools array
     */
    public getTools(): Kimiko.Types.Groq_LLM.LLMTool[] {
        this.log('getTools', []);
        const result = this.agent.getTools();
        this.log('getTools', [], result);
        return result;
    }

    /**
     * Gets the current messages array with logging
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Current messages array
     */
    public getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        this.log('getMessages', []);
        const result = this.agent.getMessages();
        this.log('getMessages', [], result);
        return result;
    }
}
