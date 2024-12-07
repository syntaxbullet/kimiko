import { Kimiko } from "@kimiko"
import { KimikoClient } from "./KimikoClient"
import { KimikoEventRegistry } from "./KimkoEventRegistry"
import { EventEmitter } from "events"

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

export interface ILLMAgent {
    id: string
    name: string
    events: EventDisclosure

    // Message management
    appendMessage(message: Kimiko.LLM.MessagePayload): void
    clearMessages(): void
    getMessages(): Kimiko.LLM.MessagePayload[]
    prependMessage(message: Kimiko.LLM.MessagePayload): void

    // Tool management
    handleToolCalls: (tool_calls: Kimiko.LLM.ToolCall[]) => Promise<Kimiko.LLM.ToolMessagePayload[]>
    registerTool: (toolManifest: Kimiko.LLM.Tool, toolHandler: ToolHandler) => void

    // Event management
    getEvents(): EventDisclosure
    registerEvents: (emitter: EventEmitter) => void

    // Configuration and state
    getConfig(): Kimiko.LLM.RequestBody
    getInstruction(): Kimiko.LLM.SystemMessagePayload
    send(configOverride: Partial<Config>): Promise<Kimiko.LLM.ChatCompletionResponse>
}

export interface IEventRegistry {
    responders: IEventResponder[]
    emitter: EventEmitter
    register(responder: IEventResponder): void
    unregister(responder: IEventResponder): void
    broadcast(event: string, data: any): void
}

export const Client = new KimikoClient()
export const EventRegistry = new KimikoEventRegistry(Client)