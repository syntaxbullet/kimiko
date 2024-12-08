import { Kimiko } from "@kimiko"
import { KimikoClient } from "./KimikoClient"
import { EventEmitter } from "events"
import { KimikoBaseAgent } from "./KimikoBaseAgent"

export type Instruction = Kimiko.LLM.SystemMessagePayload
export type Tools = Kimiko.LLM.Tool[]
export type Config = Omit<Kimiko.LLM.RequestBody, 'messages' | 'tools'>
export type Messages = Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>[]
export type EventDisclosure = { emits: string[], listensTo: string[] } 
export type ToolHandler = (...args: any) => Kimiko.LLM.ToolMessagePayload | Promise<Kimiko.LLM.ToolMessagePayload>

export type EventResponderResponse = {
    // id of the event
    id: string
    // id of the sender
    sender: string
    // id of the recipient
    recipient?: string
    // data to send
    payload: Record<string, any>
    // additional instructions for llm-based responders
    additionalInstructions?: string
}

export interface IEventResponder {
    id: string
    name: string
    events: EventDisclosure
    registerEvents: (emitter: EventEmitter) => void
}

export interface IAgent {
    id: string
    name: string
    instruction: Instruction
    messages: Messages
    tools: Tools
    config: Config
    events: { emits: string[], listensTo: string[] }
    toolHandlers: Map<string, ToolHandler>

    getName: () => string
    setName: (name: string) => void

    getId: () => string
    setId: (id: string) => void

    setEvents: (events: EventDisclosure) => void
    getEvents: () => EventDisclosure

    getInstruction: () => Instruction
    setInstruction: (instruction: Instruction) => void
    
    getMessages: () => Messages
    setMessages: (messages: Messages) => void
    appendMessage: (message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) => void
    prependMessage: (message: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) => void

    getTools: () => Tools
    setTools: (tools: Tools) => void
    registerTool: (tool: Kimiko.LLM.Tool, handler: ToolHandler) => void

    getConfig: () => Config
    setConfig: (config: Config) => void

    send(configOverride?: Config): Promise<Kimiko.LLM.ResponseBody>
    registerEvents: () => void
}

export const Client = new KimikoClient()
export const Agent = KimikoBaseAgent