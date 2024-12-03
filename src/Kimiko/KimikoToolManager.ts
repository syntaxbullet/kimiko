import { Kimiko } from ".";

/**
 * Manages the available tools and their configurations for the Kimiko LLM interface
 * @implements {Kimiko.IToolManager}
 */
export class KimikoToolManager implements Kimiko.IToolManager {
    /** Array of registered tools */
    private tools: Kimiko.Types.Groq_LLM.LLMTool[] = [];
    /** Array of callback functions to be called when tools change */
    private onChangeCallbacks: ((tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void)[] = [];
    /** Lock state of the tool manager */
    private islocked: boolean = false;

    /**
     * Retrieves all tools currently registered in the manager
     * @returns {Kimiko.Types.Groq_LLM.LLMTool[]} Array of all registered tools
     */
    getAll(): Kimiko.Types.Groq_LLM.LLMTool[] {
        return this.tools;
    }

    /**
     * Retrieves a specific tool by its name
     * @param {string} name - The name of the tool to retrieve
     * @returns {Kimiko.Types.Groq_LLM.LLMTool | undefined} The tool if found, or undefined if it does not exist
     */
    getByName(name: string): Kimiko.Types.Groq_LLM.LLMTool | undefined {
        return this.tools.find(tool => tool.function.name === name);
    }

    /**
     * Adds a new tool to the manager
     * @param {Kimiko.Types.Groq_LLM.LLMTool} tool - The tool to add
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    add(tool: Kimiko.Types.Groq_LLM.LLMTool): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Tool manager is locked"] };
        }
        if (this.has(tool.function.name)) {
            return { success: false, errors: [`Tool with name '${tool.function.name}' already exists`] };
        }
        this.tools.push(tool);
        this.onChangeCallbacks.forEach(callback => callback(this.tools));
        return { success: true };
    }

    /**
     * Removes a tool from the manager by its name
     * @param {string} name - The name of the tool to remove
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    remove(name: string): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Tool manager is locked"] };
        }
        const index = this.tools.findIndex(tool => tool.function.name === name);
        if (index === -1) {
            return { success: false, errors: [`Tool with name '${name}' not found`] };
        }
        this.tools.splice(index, 1);
        this.onChangeCallbacks.forEach(callback => callback(this.tools));
        return { success: true };
    }

    /**
     * Checks whether a tool with the specified name exists in the manager
     * @param {string} name - The name of the tool to check
     * @returns {boolean} True if the tool exists, false otherwise
     */
    has(name: string): boolean {
        return this.tools.some(tool => tool.function.name === name);
    }

    /**
     * Clears all tools from the manager
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    clear(): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Tool manager is locked"] };
        }
        this.tools = [];
        this.onChangeCallbacks.forEach(callback => callback(this.tools));
        return { success: true };
    }

    /**
     * Locks the tool manager to prevent further modifications
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    lock(): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Tool manager is already locked"] };
        }
        this.islocked = true;
        return { success: true };
    }

    /**
     * Checks whether the tool manager is currently locked
     * @returns {boolean} True if the manager is locked, false otherwise
     */
    isLocked(): boolean {
        return this.islocked;
    }

    /**
     * Returns the number of tools currently registered in the manager
     * @returns {number} The number of tools in the manager
     */
    count(): number {
        return this.tools.length;
    }

    /**
     * Checks whether the tool manager currently has any tools registered
     * @returns {boolean} True if the tool manager is empty, false otherwise
     */
    isEmpty(): boolean {
        return this.tools.length === 0;
    }

    /**
     * Registers a callback function to be invoked whenever the tool set changes
     * @param {(tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void} callback - Function to call on tool changes
     */
    onChange(callback: (tools: Kimiko.Types.Groq_LLM.LLMTool[]) => void): void {
        this.onChangeCallbacks.push(callback);
    }
}