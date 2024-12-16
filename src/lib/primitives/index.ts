import { Kimiko } from "@kimiko/types";

export function UserMessage(message: string): Kimiko.LLM.UserMessagePayload {
    return {
        role: "user",
        content: message,
    };
}

export function SystemMessage(message: string): Kimiko.LLM.SystemMessagePayload {
    return {
        role: "system",
        content: message,
    };
}

export function AssistantMessage(message: string, tool_calls?: Kimiko.LLM.ToolCall[]): Kimiko.LLM.AssistantMessagePayload {
    return {
        role: "assistant",
        content: message,
        tool_calls
    };
}

export function ToolMessage(message: string, tool_call_id: string): Kimiko.LLM.ToolMessagePayload {
    return {
        role: "tool",
        content: message,
        tool_call_id
    };
}

export const HumanMessage = UserMessage
export const AIMessage = AssistantMessage
export const PromptMessage = SystemMessage
export const FunctionMessage = ToolMessage