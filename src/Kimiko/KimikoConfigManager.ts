import { Kimiko } from ".";

/**
 * Manages configuration settings for the Kimiko LLM interface
 * @implements {Kimiko.IConfigManager}
 */
export class KimikoConfigManager implements Kimiko.IConfigManager {

    /** Current configuration settings */
    private config: Kimiko.Types.Groq_LLM.LLMRequestBody;
    /** Lock state of the configuration */
    private islocked: boolean = false;
    
    /** Default configuration settings */
    private defaultConfig: Kimiko.Types.Groq_LLM.LLMRequestBody = {
        model: "llama-3.1-70b-specdec",
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        temperature: 0.7,
        max_tokens: 500,
    };
    
    /**
     * Creates a new KimikoConfigManager instance
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody} config - Initial configuration settings
     * @param {Kimiko.IContextManager} [ContextManager] - Optional context manager to retrieve initial messages
     * @param {Kimiko.IToolManager} [ToolManager] - Optional tool manager to retrieve initial tools
     */
    constructor(config: Kimiko.Types.Groq_LLM.LLMRequestBody, ContextManager?: Kimiko.IContextManager, ToolManager?: Kimiko.IToolManager) {
        this.islocked = false;

        this.config = { ...this.defaultConfig, ...config };

        if (ContextManager) {
            ContextManager.set(this.config.messages);
            this.config.messages = ContextManager.get();
        }
        if (ToolManager) {
            this.config.tools = ToolManager.getAll();
        }
    }

    /**
     * Retrieves the entire configuration object
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody} The complete configuration
     */
    getAll(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this.config;
    }

    /**
     * Gets the value of a specific configuration key
     * @template K
     * @param {K} key - The configuration key to retrieve
     * @returns {Kimiko.Types.Groq_LLM.LLMRequestBody[K] | undefined} The value for the specified key
     */
    get<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(key: K): Kimiko.Types.Groq_LLM.LLMRequestBody[K] | undefined {
        return this.config[key];
    }

    /**
     * Sets a value for a specific configuration key
     * @template K
     * @param {K} key - The configuration key to set
     * @param {Kimiko.Types.Groq_LLM.LLMRequestBody[K]} value - The value to set
     * @throws {Error} If the configuration is locked
     */
    set<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(key: K, value: Kimiko.Types.Groq_LLM.LLMRequestBody[K]): void {
        if (this.islocked) {
            throw new Error("Config is locked");
        }
        this.config[key] = value;
    }

    /**
     * Checks if a configuration key exists
     * @template K
     * @param {K} key - The key to check
     * @returns {boolean} True if the key exists
     */
    has<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(key: K): boolean {
        return key in this.config;
    }

    /**
     * Deletes a configuration key
     * @template K
     * @param {K} key - The key to delete
     * @returns {boolean} True if the deletion was successful
     * @throws {Error} If the configuration is locked
     */
    delete<K extends keyof Kimiko.Types.Groq_LLM.LLMRequestBody>(key: K): boolean {
        if (this.islocked) {
            throw new Error("Config is locked");
        }
        delete this.config[key];
        return true;
    }

    /**
     * Checks if the configuration is locked
     * @returns {boolean} True if the configuration is locked
     */
    isLocked(): boolean {
        return this.islocked;
    }

    /**
     * Locks the configuration to prevent further modifications
     * @throws {Error} If the configuration is already locked
     */
    lock(): void {
        if (this.islocked) {
            throw new Error("Config is already locked");
        }
        this.islocked = true;
    }
}
export default KimikoConfigManager;
