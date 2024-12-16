import { Kimiko } from "@kimiko/types";
import { SystemMessage, UserMessage } from ".";
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

function validateParameters(prompt: Kimiko.LLM.SystemMessagePayload, config: Kimiko.LLM.RequestBody) {
    if (!process.env.LLM_API_KEY) {
        throw new Error("LLM_API_KEY is not set");
    }
    if (!process.env.LLM_API_URL) {
        throw new Error("LLM_API_URL is not set");
    }
    if (!prompt) {
        throw new Error("prompt is required");
    }
    if (!config) {
        throw new Error("config is required");
    }
    if (!config.messages) {
        throw new Error("messages is required");
    }
    if (!config.model) {
        throw new Error("model is required");
    }
}

export function BaseLLM(prompt: Kimiko.LLM.SystemMessagePayload | string, config: Kimiko.LLM.RequestBody) {

    async function invoke() {
        if (typeof prompt === "string") {
            prompt = SystemMessage(prompt)
        }
        validateParameters(prompt, config)
        if (config.messages[0].role !== "system") {
            config.messages.unshift(prompt)
        }
        const response = await fetch(process.env.LLM_API_URL!, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.LLM_API_KEY}`
            },
            body: JSON.stringify(config)
        });
        return await response.json() as Kimiko.LLM.ResponseBody
    }

    async function instruct(message: Kimiko.LLM.UserMessagePayload | string) {
        if (typeof message === "string") {
            message = UserMessage(message)
        }
        // temporarily add the message to the config
        config.messages.push(message)
        const response = await invoke()
        config.messages.pop() // Remove the last message to keep the context clean
        return response
    }

    async function batchInstruct(messages: Kimiko.LLM.UserMessagePayload[] | string[]) {
        const results = []
        for (const message of messages) {
            const processedMessage = typeof message === "string" ? UserMessage(message) : message
            config.messages.push(processedMessage)
            const response = await invoke()
            results.push(response)
            config.messages.pop() // Remove the last message to keep the context clean
        }
        return results
    }

    return {
        invoke,
        instruct,
        batchInstruct,
    }
}