import { Kimiko } from "@kimiko";

/**
 * Manages the context and message history for the Kimiko LLM interface
 * @implements {Kimiko.IContextManager}
 */
export class KimikoContextManager implements Kimiko.IContextManager {
    
    /** Array of message payloads representing the conversation context */
    private context: Kimiko.Types.Groq_LLM.LLMMessagePayload[] = [];
    /** Array of callback functions to be called when context changes */
    private onChangeCallbacks: ((messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]) => void)[] = [];
    /** Lock state of the context */
    private islocked: boolean = false;

    /**
     * Retrieves the current context
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} Array of message payloads
     */
    get(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this.context;
    }

    /**
     * Sets the entire context
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload[]} messages - Array of message payloads
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    set(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Context is locked"] };
        }
        this.context = messages;
        this.onChangeCallbacks.forEach((callback) => callback(this.context));
        return { success: true };
    }

    /**
     * Appends a message to the end of the context
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message payload to append
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    append(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Context is locked"] };
        }
        this.context.push(message);
        this.onChangeCallbacks.forEach((callback) => callback(this.context));
        return { success: true };
    }

    /**
     * Prepends a message to the beginning of the context
     * @param {Kimiko.Types.Groq_LLM.LLMMessagePayload} message - Message payload to prepend
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    prepend(message: Kimiko.Types.Groq_LLM.LLMMessagePayload): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Context is locked"] };
        }
        this.context.unshift(message);
        this.onChangeCallbacks.forEach((callback) => callback(this.context));
        return { success: true };
    }

    /**
     * Registers a callback function to be called when the context changes
     * @param {(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]) => void} callback - Function to call on context change
     */
    onChange(callback: (messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]) => void): void {
        this.onChangeCallbacks.push(callback);
    }

    /**
     * Locks the context to prevent further modifications
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    lock(): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Context is already locked"] };
        }
        this.islocked = true;
        return { success: true };
    }

    /**
     * Clears the context
     * @returns {{ success: boolean; errors?: string[]; }} Result object indicating success or failure
     */
    clear(): { success: boolean; errors?: string[]; } {
        if (this.islocked) {
            return { success: false, errors: ["Context is locked"] };
        }
        this.context = [];
        this.onChangeCallbacks.forEach((callback) => callback(this.context));
        return { success: true };
    }

    /**
     * Checks if the context is empty
     * @returns {boolean} True if the context is empty, false otherwise
     */
    isEmpty(): boolean {
        return this.context.length === 0;
    }

    /**
     * Checks if the context is locked
     * @returns {boolean} True if the context is locked, false otherwise
     */
    isLocked(): boolean {
        return this.islocked;
    }

    /**
     * Returns the number of messages in the context
     * @returns {number} Number of messages in the context
     */
    count(): number {
        return this.context.length;
    }

    /**
     * Returns the first message in the context
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined} First message in the context, or undefined if the context is empty
     */
    getFirst(): Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined {
        return this.context[0];
    }

    /**
     * Returns the last message in the context
     * @returns {Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined} Last message in the context, or undefined if the context is empty
     */
    getLast(): Kimiko.Types.Groq_LLM.LLMMessagePayload | undefined {
        return this.context[this.context.length - 1];
    }

}
