import { Kimiko } from "@kimiko";
import { Message as DiscordMessage } from "discord.js";
import EventEmitter from "events";

export class ExampleAgent implements Kimiko.Core.ILLMAgent {
    public id: string = "443fewfwa";
    public name: string = "Example Agent";
    public events = {
        emits: ["example::beforeResponse"],
        listensTo: ["messageCreate"]
    };
    private instruction: Kimiko.Core.Instruction = {
        role: "system",
        content: "You are a helpful assistant."
    };
    private config: Kimiko.Core.Config = {
        model: "llama-3.3-70b-specdec",
        temperature: 0.3,
        max_tokens: 1000,
    };
    private tools: Kimiko.Core.Tools = []
    private toolHandlerMap: Map<string, Kimiko.Core.ToolHandler> = new Map();
    private messages: Kimiko.Core.Messages = [];

    private handleMessageCreate = (message: DiscordMessage) => {
        console.log(`Received message: ${message.content}, from ${message.author.username}`);
    }

    public registerEvents(emitter: EventEmitter): void {
        emitter.on("messageCreate", this.handleMessageCreate);
    }

    public registerTool(toolManifest: Kimiko.LLM.Tool, toolHandler: Kimiko.Core.ToolHandler): void {
        this.toolHandlerMap.set(toolManifest.function.name, toolHandler);
    }

    public async send(configOverride: Partial<Kimiko.Core.Config>): Promise<Kimiko.LLM.ChatCompletionResponse> {
        const payload: Kimiko.LLM.RequestBody = {
            ...this.config,
            ...configOverride,
            messages: [this.instruction, ...this.messages],
            tools: this.tools
        };
        
        try {
            const response = await fetch(process.env.LLM_API_URL!, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.LLM_API_KEY}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`LLM API returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json() as Kimiko.LLM.ChatCompletionResponse;
            return data;
        } catch (error) {
            console.error("Error sending message to LLM API:", error);
            throw error;
        }
    }

    public appendMessage(message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>): void {
        this.messages.push(message);
    }

    public prependMessage(message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>): void {
        this.messages.unshift(message);
    }

    public clearMessages(): void {
        this.messages = [];
    }

    public getMessages(): Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>[] {
        return this.messages;
    }

    public getEvents(): Kimiko.Core.EventDisclosure {
        return this.events;
    }

    public getInstruction(): Kimiko.LLM.SystemMessagePayload {
        return this.instruction;
    }

    public getConfig(): Kimiko.LLM.RequestBody {
        return {
            ...this.config,
            messages: [this.instruction, ...this.messages],
            tools: this.tools
        };
    }

    public async handleToolCalls(tool_calls: Kimiko.LLM.ToolCall[]): Promise<Kimiko.LLM.ToolMessagePayload[]> {
        const responses: Kimiko.LLM.ToolMessagePayload[] = [];
        for (const tool_call of tool_calls) {
            const tool = this.toolHandlerMap.get(tool_call.function.name);
            if (!tool) {
                throw new Error(`Tool ${tool_call.function.name} not found`);
            }
            const response = await tool(tool_call);
            responses.push(response);
        }
        return responses;
    }
}
