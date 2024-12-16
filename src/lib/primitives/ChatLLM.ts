import { Kimiko } from "@kimiko/types";
import { BaseLLM } from "./BaseLLM";
import { UserMessage } from ".";

export function ChatLLM(prompt: Kimiko.LLM.SystemMessagePayload | string, config: Kimiko.LLM.RequestBody) {
    // Create a deep copy of the config to prevent mutation across instances
    const messageCopy = [...config.messages];
    const configCopy = { ...config, messages: messageCopy };

    const llm = BaseLLM(prompt, configCopy)

    function appendMessage(message: Kimiko.LLM.MessagePayload | string) {
        const processedMessage = typeof message === "string" ? UserMessage(message) : message;
        configCopy.messages.push(processedMessage);
        return ChatLLM(prompt, configCopy);
    }

    function popMessage() {
        configCopy.messages.pop();
        return ChatLLM(prompt, configCopy);
    }

    function clearMessages() {
        configCopy.messages = [];
        return ChatLLM(prompt, configCopy);
    }
    
    return {
        ...llm,
        appendMessage,
        popMessage,
        clearMessages
    }
}