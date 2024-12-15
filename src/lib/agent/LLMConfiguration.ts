import { Kimiko } from "@kimiko/types";

/** 
 * Represents the configuration type for LLM (Large Language Model) requests, 
 * excluding messages and tools from the original request body.
 * @typedef {Object} LLMConfigurationType
 * @type {Omit<Kimiko.LLM.RequestBody, 'messages' | 'tools'>}
 */
export type LLMConfigurationType = Omit<Kimiko.LLM.RequestBody, 'messages' | 'tools'>

/** 
 * Defines the interface for managing LLM configuration with methods to 
 * get, set, and manipulate configuration parameters.
 * @typedef {Object} LLMConfiguration
 * @property {<K extends keyof LLMConfigurationType>(key: K, value: LLMConfigurationType[K]) => void} set - Set a specific configuration parameter
 * @property {<K extends keyof LLMConfigurationType>(key: K) => LLMConfigurationType[K]} get - Retrieve a specific configuration parameter
 * @property {() => LLMConfigurationType} getAll - Retrieve the entire configuration
 * @property {(config: LLMConfigurationType) => void} setAll - Replace the entire configuration
 * @property {<K extends keyof LLMConfigurationType>(key: K) => boolean} has - Check if a configuration parameter exists
 */
export type LLMConfiguration = {
    set<K extends keyof LLMConfigurationType>(key: K, value: LLMConfigurationType[K]): void
    get<K extends keyof LLMConfigurationType>(key: K): LLMConfigurationType[K]
    getAll(): LLMConfigurationType
    setAll(config: LLMConfigurationType): void
    has<K extends keyof LLMConfigurationType>(key: K): boolean
}

/**
 * Creates a configurable LLM (Large Language Model) configuration manager.
 * Allows dynamic modification and retrieval of configuration parameters.
 * 
 * @param {LLMConfigurationType} defaults - Initial configuration parameters
 * @returns {LLMConfiguration} A configuration object with methods to manage settings
 * 
 * @example
 * const config = createLLMConfiguration({ 
 *   temperature: 0.7, 
 *   max_tokens: 100 
 * });
 * config.set('temperature', 0.5);
 * console.log(config.get('temperature')); // 0.5
 */
export function createLLMConfiguration(defaults: LLMConfigurationType): LLMConfiguration {
    let config: LLMConfigurationType = { ...defaults }
    return {
        /**
         * Sets a specific configuration parameter.
         * @param {K} key - The configuration key to set
         * @param {LLMConfigurationType[K]} value - The value to assign to the configuration key
         */
        set<K extends keyof LLMConfigurationType>(key: K, value: LLMConfigurationType[K]) {
            config[key] = value
        },

        /**
         * Retrieves the value of a specific configuration parameter.
         * @param {K} key - The configuration key to retrieve
         * @returns {LLMConfigurationType[K]} The value of the specified configuration key
         */
        get<K extends keyof LLMConfigurationType>(key: K): LLMConfigurationType[K] {
            return config[key]
        },

        /**
         * Returns the entire configuration object.
         * @returns {LLMConfigurationType} The complete configuration
         */
        getAll(): LLMConfigurationType {
            return config
        },

        /**
         * Replaces the entire configuration with a new configuration object.
         * @param {LLMConfigurationType} configPayload - The new configuration to set
         */
        setAll(configPayload: LLMConfigurationType) {
            config = configPayload
        },

        /**
         * Checks if a specific configuration parameter exists.
         * @param {K} key - The configuration key to check
         * @returns {boolean} True if the key exists in the configuration, false otherwise
         */
        has<K extends keyof LLMConfigurationType>(key: K): boolean {
            return key in config
        }
    }
}