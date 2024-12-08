import { Kimiko } from '@kimiko'
import EventEmitter from 'events'
import { config as dotenvConfig } from 'dotenv'

dotenvConfig()

export class KimikoBaseAgent implements Kimiko.Core.IAgent {
    public id: string
    public name: string
    public events: Kimiko.Core.EventDisclosure
    public instruction: Kimiko.Core.Instruction
    public messages: Kimiko.Core.Messages
    public tools: Kimiko.Core.Tools
    public config: Kimiko.Core.Config
    public toolHandlers: Map<string, Kimiko.Core.ToolHandler>
    public emitter: EventEmitter
  

    constructor(emitter: EventEmitter) {
        this.emitter = emitter
        this.toolHandlers = new Map()
        this.messages = []
        this.tools = []
        this.config = {
            model: 'llama-3.3-70b-specdec',
        }
        this.instruction = {
            role: 'system',
            content: `You are Kimiko, a helpful and cheerful assistant.`,
        }
        this.id = 'base'
        this.name = 'base'
        this.events = { emits: [], listensTo: [] }
        this.emitter.emit(`${this.name}::create`, this)
    }

    getName(): string {
        this.emitter.emit(`${this.name}::getName`, this.name)
        return this.name
    }

    setName(name: string) {
        this.emitter.emit(`${this.name}::setName`, name)
        this.name = name
    }

    getId(): string {
        this.emitter.emit(`${this.name}::getId`, this.id)
        return this.id
    }

    setId(id: string) {
        this.emitter.emit(`${this.name}::setId`, id)
        this.id = id
    }

    setEvents(events: Kimiko.Core.EventDisclosure) {
        this.emitter.emit(`${this.name}::setEvents`, events)
        this.events = events
    }

    getEvents(): Kimiko.Core.EventDisclosure {
        this.emitter.emit(`${this.name}::getEvents`, this.events)
        return this.events
    }

    getInstruction(): Kimiko.LLM.SystemMessagePayload {
        this.emitter.emit(`${this.name}::getInstruction`, this.instruction)
        return this.instruction
    }

    setInstruction(instruction: Kimiko.LLM.SystemMessagePayload) {
        this.emitter.emit(`${this.name}::setInstruction`, instruction)
        this.instruction = instruction
    }

    getMessages(): Kimiko.Core.Messages {
        this.emitter.emit(`${this.name}::getMessages`, this.messages)
        return this.messages
    }

    setMessages(messages: Kimiko.Core.Messages) {
        this.messages = messages
        this.emitter.emit(`${this.name}::setMessages`, messages)
    }

    appendMessage(message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) {
        this.messages.push(message)
        this.emitter.emit(`${this.name}::appendMessage`, message)
    }

    prependMessage(message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) {
        this.messages.unshift(message)
        this.emitter.emit(`${this.name}::prependMessage`, message)
    }

    getTools(): Kimiko.Core.Tools {
        this.emitter.emit(`${this.name}::getTools`, this.tools)
        return this.tools
    }

    setTools(tools: Kimiko.Core.Tools) {
        this.tools = tools
        this.emitter.emit(`${this.name}::setTools`, tools)
    }

    registerTool(tool: Kimiko.LLM.Tool, handler: Kimiko.Core.ToolHandler) {
        this.toolHandlers.set(tool.function.name, handler)
        this.emitter.emit(`${this.name}::registerTool`, tool, handler)
    }

    getConfig(): Kimiko.Core.Config {
        this.emitter.emit(`${this.name}::getConfig`, this.config)
        return this.config
    }

    setConfig(config: Kimiko.Core.Config) {
        this.config = config
        this.emitter.emit(`${this.name}::setConfig`, config)
    }

    async send(configOverride?: Kimiko.Core.Config): Promise<Kimiko.LLM.ResponseBody> {
        this.emitter.emit(`${this.name}::send`, this.config, configOverride)

        const payload = {
            ...this.config,
            ...configOverride,
            messages: [this.instruction, ...this.messages],
            tools: this.tools,
        }
        if (!process.env.LLM_API_URL) {
            throw new Error('LLM_API_URL is not defined')
        }
        if (!process.env.LLM_API_KEY) {
            throw new Error('LLM_API_KEY is not defined')
        }
        if (!payload.model) {
            throw new Error('Model is not defined')
        }
        if (!payload.messages) {
            throw new Error('Messages are not defined')
        }
        try {
            const response = await fetch(process.env.LLM_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.LLM_API_KEY}`,
                },
                body: JSON.stringify(payload),
            })

            if (response.ok) {
                const data = (await response.json()) as Kimiko.LLM.ResponseBody
                return data
            } else {
                throw new Error(`LLM API returned non-200 status code: ${response.status}`)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            throw new Error('Failed to send message')
        }
    }
    registerEvents() {
        throw new Error('Method not implemented.')
    }
}
