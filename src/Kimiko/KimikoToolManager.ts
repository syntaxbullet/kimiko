import { Kimiko } from ".";

/**
 * Manages the available tools and their configurations for the Kimiko LLM interface
 * @implements {Kimiko.IToolManager}
 */
export class KimikoToolManager implements Kimiko.IToolManager {
    /** Array of registered tools */
    private tools: Kimiko.Types.Groq_LLM.LLMTool[] = [];
    /** Map of tool names to their handlers */
    private handlers: Map<string, (message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload) => Kimiko.Types.Groq_LLM.LLMChatCompletionResponse> = new Map();
    /** Array of callback functions to be called when tools change */
    private onChangeCallbacks: ((tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void)[] = [];
    /** Flag indicating whether the manager is locked */
    private islocked: boolean = false;

    /**
     * Registers a new tool in the tool manager.
     * @param tool - The tool to register.
     * @param handler - The handler function for the tool.
     * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
     */
    register(
        tool: Kimiko.Types.Groq_LLM.LLMTool,
        handler: (message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload) => Kimiko.Types.Groq_LLM.LLMChatCompletionResponse
    ): { success: boolean; errors?: string[] } {
        if (this.islocked) {
            return { success: false, errors: ['The tool manager is locked, unable to register tools.'] };
        }
        this.tools.push(tool);
        this.handlers.set(tool.function.name, handler);
        this.onChangeCallbacks.forEach((callback) => callback(this.tools));
        return { success: true };
    }

    /**
     * Unregisters a tool from the tool manager.
     * @param name - The name of the tool to unregister.
     * @returns An object indicating success status and any errors if the operation fails (e.g., if locked).
     */
    unregister(name: string): { success: boolean; errors?: string[] } {
        if (this.islocked) {
            return { success: false, errors: ['The tool manager is locked, unable to unregister tools.'] };
        }
        const index = this.tools.findIndex((tool) => tool.function.name === name);
        if (index === -1) {
            return { success: false, errors: ['Tool not found.'] };
        }
        this.tools.splice(index, 1);
        this.handlers.delete(name);
        this.onChangeCallbacks.forEach((callback) => callback(this.tools));
        return { success: true };
    }

    /**
     * Retrieves all registered tools in the tool manager.
     * @returns An array of all registered tools.
     */
    getAll(): Kimiko.Types.Groq_LLM.LLMTool[] {
        return this.tools;
    }

    /**
     * Retrieves a specific tool by its name.
     * @param name - The name of the tool to retrieve.
     * @returns The tool if found, or undefined if it does not exist.
     */
    getByName(name: string): Kimiko.Types.Groq_LLM.LLMTool | undefined {
        return this.tools.find((tool) => tool.function.name === name);
    }

    /**
     * Checks whether the tool manager has a tool with the specified name.
     * @param name - The name of the tool to check.
     * @returns True if the tool exists, otherwise false.
     */
    has(name: string): boolean {
        return this.tools.some((tool) => tool.function.name === name);
    }
    /**
     * Registers a callback function to be invoked whenever the tool manager changes.
     * @param callback - A function that is called with the updated list of tools.
     */
    onChange(callback: (tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void): void {
        this.onChangeCallbacks.push(callback);
    }

    /**
     * Locks the tool manager to prevent further modifications.
     * @returns An object indicating success status and any errors if the operation fails.
     */
    lock(): { success: boolean; errors?: string[] } {
        this.islocked = true;
        return { success: true };
    }

    /**
     * Checks whether the tool manager is currently locked.
     * @returns True if the manager is locked, otherwise false.
     */
    isLocked(): boolean {
        return this.islocked;
    }

    /**
     * Checks whether the tool manager currently has any tools registered.
     * @returns True if the tool manager is empty, otherwise false.
     */
    isEmpty(): boolean {
        return this.tools.length === 0;
    }
}

