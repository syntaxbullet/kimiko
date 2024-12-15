import { createAgent } from "@kimiko/agent";
import { createTrackableMessageStore } from "@kimiko/agent/MessageStore";
import { createToolsRegistry, ToolCallHandler } from "@kimiko/agent/ToolsRegistry";
import { createLLMConfiguration } from "@kimiko/agent/LLMConfiguration";
import { EventEmitter } from "events";
import { Tool, UserMessagePayload } from "@kimiko/types/llm.types";

const getCurrentTime = () => new Date().toLocaleTimeString();

const getCurrentWeather = async (location: string) => { 
    return `The weather in ${location} is sunny`;
}

const getCurrentTimeTool: Tool = {
    function: {
        name: "get_current_time",
        description: "Returns the current time in a user readable format",
        parameters: {
            type: "object",
            properties: {},
        },
    },
    type: "function",
}

const getCurrentWeatherTool: Tool = {
    function: {
        name: "get_current_weather",
        description: "Returns the current weather in a user readable format",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The location to get the weather for",
                },
            },
            required: ["location"],
        },
    },
    type: "function",
}


const getCurrentWeatherHandler: ToolCallHandler = (ctx, args) => getCurrentWeather(JSON.parse(args!).location);
const getCurrentTimeHandler: ToolCallHandler = () => getCurrentTime();


const store = createTrackableMessageStore();
const tools = createToolsRegistry();
const config = createLLMConfiguration({ model: "llama-3.3-70b-versatile" });

const agent = createAgent({ store, tools, config, events: new EventEmitter() }, {
    role: "system",
    content: "You are a helpful assistant",
});

tools.register(getCurrentTimeTool, getCurrentTimeHandler);
tools.register(getCurrentWeatherTool, getCurrentWeatherHandler);

(async () => {
    agent.ctx.events.on("tools::call", (toolCalls) => {
        console.log("Tool calls:", toolCalls);
    });

    agent.ctx.events.on("tools::result", (toolResults) => {
        console.log("Tool results:", toolResults);
    });
    try {
        console.log("Sending message...");
        const test: UserMessagePayload = {
            role: "user",
            content: "Hello, can you tell me what time it is in a human readable format?, also check the weather in San Francisco",
        };
        const tr = agent.ctx.store.fromLLMMessage(test);
        agent.ctx.store.append(tr);

        const response = await agent.send();
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error);
    }
})();