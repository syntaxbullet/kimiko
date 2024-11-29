import { ChoiceMessage, CompletionResponse, KimikoAgent, LLMRequestPayload } from './KimikoAgent'
import fs from 'fs'
import path from 'path'

const memoryPrompt = fs.readFileSync(
    path.resolve(__dirname, '..', 'prompts', 'memory.md'),
    { encoding: 'utf-8' }
)

interface Memory {
    context: string
    content: string
    createdAt: string
}

export class KimikoMemoryAgent extends KimikoAgent {
    private tools: {
        function?: {
            description?: string
            name?: string
            parameters?: Record<string, any>
        }
        type: 'function'
    }[] = [
        {
            type: "function",
            function: {
                name: 'insert_memory',
                parameters: {
                    type: 'object',
                    properties: {
                        context: {
                            type: 'string',
                            description:
                                'A short description about the context of the conversation where this memory was from.',
                        },
                        content: {
                            type: 'string',
                            description: 'The content of the memory.',
                        },
                    },
                    required: ['context', 'content'],
                    additionalProperties: false,
                },
            },
        },
    ]
    private toolHandlers: Record<string, Function> = {
        insert_memory: this.addMemory,
    }

    private handleToolCall(ctx: any, name: string, args?: string): void {
        if (!this.toolHandlers[name]) return
        this.toolHandlers[name](ctx, name, args)
    }

    /**
     * Adds a memory to memories.json.
     * @param {Object} args - Optional arguments containing context and content fields.
     * @param {string} args.context - The context of the memory.
     * @param {string} args.content - The content of the memory.
     */
    public addMemory(
        ctx: any,
        name: string,
        args: { context: string; content: string }
    ): void {
        const filePath = path.join(process.cwd(), 'memories.json')

        // Ensure args has context and content fields
        const { context, content } = args
        if (!context || !content) {
            console.error("Both 'context' and 'content' fields are required.")
            return
        }

        // Create an empty memories array if the file doesn't exist
        let memories: Memory[] = []
        if (fs.existsSync(filePath)) {
            try {
                const fileData = fs.readFileSync(filePath, 'utf-8')
                memories = JSON.parse(fileData) as Memory[] // Parse existing memories
            } catch (error) {
                console.error('Error reading or parsing memories.json:', error)
                return
            }
        }

        // Create a new memory object and add it to the array
        const newMemory: Memory = {
            context,
            content,
            createdAt: new Date().toISOString(),
        }
        memories.push(newMemory)

        // Write updated memories array back to the file
        try {
            fs.writeFileSync(
                filePath,
                JSON.stringify(memories, null, 2),
                'utf-8'
            )
            console.log('Memory added successfully.')
        } catch (error) {
            console.error('Error writing to memories.json:', error)
        }
    }

    public async sendCompletion(requestPayload?: LLMRequestPayload, context?: ChoiceMessage[]): Promise<CompletionResponse> {
        const response = await super.sendCompletion({tools: this.tools, parallel_tool_calls: false});
        if (response.choices[0].finish_reason === "tool_calls") {

            const tool_name = response.choices[0].message.tool_calls?.[0].function.name;
            const args = response.choices[0].message.tool_calls?.[0].function.arguments;

            if (!tool_name || !args) return response
            
            this.handleToolCall("", tool_name, args)
        }
        return response;
    }
    constructor() {
        super(memoryPrompt)
    }
}
