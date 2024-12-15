import { Kimiko } from "@kimiko/types";
import { AgentDeps } from ".";
/**
 * Represents a function that handles tool calls with a given context and optional arguments.
 * @callback ToolCallHandler
 * @param {any} ctx - The context in which the tool is being called
 * @param {string} [args] - Optional arguments for the tool call
 * @returns {any} The result of the tool call
 */
export type ToolCallHandler = (ctx: AgentDeps, args?: string) => any;

export type ToolRegistry = {
    register: (tool: Kimiko.LLM.Tool, handler: ToolCallHandler) => void;
    unregister: (name: string) => void;
    getHandler: (name: string) => ToolCallHandler | undefined;
    getDefinition: (name: string) => Kimiko.LLM.Tool | undefined;
    getDefinitions: () => Kimiko.LLM.Tool[];
    getHandlers: () => ToolCallHandler[];
    getNames: () => string[];
}

/**
 * Creates a registry for managing tools and their associated handlers.
 * Provides methods to register, unregister, and retrieve tools and their implementations.
 * 
 * @returns {Object} A tools registry with methods for tool management
 * 
 * @example
 * const registry = createToolsRegistry();
 * 
 * // Register a tool
 * registry.register({
 *   function: {
 *     name: 'calculateSum',
 *     description: 'Calculates the sum of two numbers'
 *   }
 * }, (ctx, args) => {
 *   const [a, b] = JSON.parse(args);
 *   return a + b;
 * });
 * 
 * // Get a tool's handler
 * const sumHandler = registry.getHandler('calculateSum');
 */
export function createToolsRegistry(): ToolRegistry {
    /** 
     * Internal map to store tool call handlers 
     * @type {Map<string, ToolCallHandler>}
     * @private
     */
    const handlers = new Map<string, ToolCallHandler>();

    /** 
     * Internal map to store tool definitions 
     * @type {Map<string, Kimiko.LLM.Tool>}
     * @private
     */
    const definitions = new Map<string, Kimiko.LLM.Tool>();

    return {
        /**
         * Registers a new tool with its corresponding handler.
         * 
         * @param {Kimiko.LLM.Tool} tool - The tool definition to register
         * @param {ToolCallHandler} handler - The function to handle tool calls
         */
        register(tool: Kimiko.LLM.Tool, handler: ToolCallHandler) {
            handlers.set(tool.function.name, handler);
            definitions.set(tool.function.name, tool);
        },

        /**
         * Removes a tool and its handler from the registry.
         * 
         * @param {string} name - The name of the tool to unregister
         */
        unregister(name: string) {
            handlers.delete(name);
            definitions.delete(name);
        },

        /**
         * Retrieves the handler for a specific tool.
         * 
         * @param {string} name - The name of the tool to retrieve the handler for
         * @returns {ToolCallHandler | undefined} The tool's handler, or undefined if not found
         */
        getHandler(name: string) {
            return handlers.get(name);
        },

        /**
         * Retrieves the definition for a specific tool.
         * 
         * @param {string} name - The name of the tool to retrieve the definition for
         * @returns {Kimiko.LLM.Tool | undefined} The tool's definition, or undefined if not found
         */
        getDefinition(name: string) {
            return definitions.get(name);
        },

        /**
         * Retrieves all registered tool definitions.
         * 
         * @returns {Kimiko.LLM.Tool[]} An array of all registered tool definitions
         */
        getDefinitions() {
            return Array.from(definitions.values());
        },

        /**
         * Retrieves all registered tool handlers.
         * 
         * @returns {ToolCallHandler[]} An array of all registered tool handlers
         */
        getHandlers() {
            return Array.from(handlers.values());
        },

        /**
         * Retrieves the names of all registered tools.
         * 
         * @returns {string[]} An array of tool names
         */
        getNames() {
            return Array.from(handlers.keys());
        }
    }
}