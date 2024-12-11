import KimikoConversationalContextProvider from "@kimiko/KimikoConversationalContextProvider"
import { Kimiko } from "."
import { KimikoClient } from "../KimikoClient"

export type TrackableConversationMessage = Kimiko.LLM.MessagePayload & { id: string, createdAt: number, updatedAt: number }

export interface IConversationalContextProvider {
    get(id: string): TrackableConversationMessage | undefined
    getAll(): TrackableConversationMessage[]
    set(messages: TrackableConversationMessage[]): void
    append(message: TrackableConversationMessage | Kimiko.LLM.MessagePayload): void
    prepend(message: TrackableConversationMessage | Kimiko.LLM.MessagePayload): void
    remove(id: string): void
    edit(id: string, message: TrackableConversationMessage | Kimiko.LLM.MessagePayload): void
    clear(): void
}

export const Client = new KimikoClient()
export const ConversationalContextProvider = new KimikoConversationalContextProvider()