import { Kimiko } from '.'
import { config as dotEnvConfig } from 'dotenv'

dotEnvConfig()

/**
 * The main agent class that orchestrates interactions between configuration, context, tools, and the LLM
 * @implements {Kimiko.IAgent}
 */
export class KimikoAgent implements Kimiko.IAgent {
    /** Configuration manager instance */
    private configManager: Kimiko.IConfigManager
    /** Context manager instance */
    private contextManager: Kimiko.IContextManager
    /** Tool manager instance */
    private toolManager: Kimiko.IToolManager
    /** Event Emitter  */
    public events: Kimiko.IKimikoEmitter

    /** Array of callback functions to be invoked on request completion */
    private onRequestCallbacks: ((
        request: Kimiko.Types.Groq_LLM.LLMRequestBody,
        response: Kimiko.Types.Groq_LLM.LLMChatCompletionResponse
    ) => void)[] = []

    /**
     * Creates a new KimikoAgent instance
     * @param {Kimiko.IConfigManager} configManager - Configuration manager instance
     * @param {Kimiko.IContextManager} contextManager - Context manager instance
     * @param {Kimiko.IToolManager} toolManager - Tool manager instance
     */
    constructor(
        configManager: Kimiko.IConfigManager,
        contextManager: Kimiko.IContextManager,
        toolManager: Kimiko.IToolManager,
        eventEmitter: Kimiko.IKimikoEmitter
    ) {
        this.configManager = configManager
        this.contextManager = contextManager
        this.toolManager = toolManager
        this.events = eventEmitter
    }

    /**
     * Sends a message to the LLM and returns the response
     * @param {string} message - The message to send to the LLM
     * @param {Partial<Kimiko.Types.Groq_LLM.LLMRequestBody>} [overrideConfig] - Optional configuration overrides
     * @returns {Promise<Kimiko.Types.Groq_LLM.LLMChatCompletionResponse>} The LLM's response
     * @throws {Error} If messages are missing in the payload or if the API request fails
     */
    async send(
        overrideConfig?: Partial<Kimiko.Types.Groq_LLM.LLMRequestBody>
    ): Promise<Kimiko.Types.Groq_LLM.LLMChatCompletionResponse> {
        const baseConfig = this.configManager.getAll();
        const request = {
            ...baseConfig,
            ...overrideConfig,
            messages: [
                ...this.contextManager.get()
            ],
        }

        if (!request.messages || request.messages.length === 0) {
            throw new Error('Messages are required in the payload')
        }
        try {
            const response = await fetch(this.getBaseURL(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.LLM_API_KEY}`,
                },
                body: JSON.stringify(request),
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
     * Gets the base URL for the LLM API
     * @returns {string} The base URL for the API, either from environment variable or default Groq endpoint
     * @private
     */
    private getBaseURL(): string {
        return (
            process.env.LLM_API_BASE_URL ||
            'https://api.groq.com/openai/v1/chat/completions'
        )
    }

    /**
     * Gets the configuration manager instance
     * @returns {Kimiko.IConfigManager} The configuration manager
     */
    getConfigManager(): Kimiko.IConfigManager {
        return this.configManager
    }

    /**
     * Gets the context manager instance
     * @returns {Kimiko.IContextManager} The context manager
     */
    getContextManager(): Kimiko.IContextManager {
        return this.contextManager
    }

    /**
     * Gets the tool manager instance
     * @returns {Kimiko.IToolManager} The tool manager
     */
    getToolManager(): Kimiko.IToolManager {
        return this.toolManager
    }

    /**
     * Registers a callback function to be invoked whenever the agent processes a request
     * @param {(request: Kimiko.Types.Groq_LLM.LLMRequestBody, response: Kimiko.Types.Groq_LLM.LLMChatCompletionResponse) => void} callback - Function to call on request completion
     * @returns {() => void} A function that can be called to remove the callback
     */
    onRequest(
        callback: (
            request: Kimiko.Types.Groq_LLM.LLMRequestBody,
            response: Kimiko.Types.Groq_LLM.LLMChatCompletionResponse
        ) => void
    ): () => void {
        this.onRequestCallbacks.push(callback)
        return () => {
            this.onRequestCallbacks = this.onRequestCallbacks.filter(
                (cb) => cb !== callback
            )
        }
    }
}
