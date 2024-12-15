import { Kimiko } from "@kimiko/types";
import { Message as DiscordMessage } from "discord.js";
import { randomUUID } from "node:crypto";

 /** 
 * Represents a trackable message with additional metadata.
 * @typedef {Object} TrackableMessage
 * @property {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>} payload - The message payload
 * @property {string} id - Unique identifier for the message
 * @property {Date} createdAt - Timestamp when the message was created
 * @property {Date} updatedAt - Timestamp when the message was last updated
 */
export type TrackableMessage = {
    payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>
    id: string
    createdAt: Date
    updatedAt: Date
}

/** 
 * Defines the interface for a trackable message store with various message manipulation methods.
 * @typedef {Object} TrackableMessageStore
 * @property {(id: string) => TrackableMessage | undefined} get - Retrieve a message by its ID
 * @property {() => TrackableMessage[]} getAll - Get all stored messages
 * @property {() => TrackableMessage | undefined} getFirst - Get the first message in the store
 * @property {() => TrackableMessage | undefined} getLast - Get the last message in the store
 * @property {(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage) => TrackableMessage} append - Add a message to the end of the store
 * @property {(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage) => TrackableMessage} prepend - Add a message to the beginning of the store
 * @property {(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage, index: number) => TrackableMessage} inject - Insert a message at a specific index
 * @property {(id: string, payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) => void} update - Update an existing message
 * @property {(id: string) => void} delete - Remove a message by its ID
 * @property {(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) => TrackableMessage} fromLLMMessage - Create a trackable message from an LLM message payload
 * @property {(payload: DiscordMessage) => TrackableMessage} fromDiscordMessage - Create a trackable message from a Discord message
 * @property {(payload: TrackableMessage) => Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>} toLLMMessage - Convert a trackable message to an LLM message payload
 * @property {() => void} clear - Remove all messages from the store
 * @property {() => boolean} isEmpty - Check if the message store is empty
 */
export type TrackableMessageStore = {
    get(id: string): TrackableMessage | undefined
    getAll(): TrackableMessage[]
    getFirst(): TrackableMessage | undefined
    getLast(): TrackableMessage | undefined
    append(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage): TrackableMessage
    prepend(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage): TrackableMessage
    inject(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage, index: number): TrackableMessage
    update(id: string, payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>): void
    delete(id: string): void
    fromLLMMessage(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>): TrackableMessage
    fromDiscordMessage(payload: DiscordMessage): TrackableMessage
    toLLMMessage(payload: TrackableMessage): Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>
    clear(): void
    isEmpty(): boolean
}

export type MessageStore = {
    get(id: string): any
    getAll(): any[]
    getFirst(): any
    getLast(): any
    append(payload: any): any
    prepend(payload: any): any
    inject(payload: any, index: number): any
    update(id: string, payload: any): void
    delete(id: string): void
    fromLLMMessage(payload: any): any
    fromDiscordMessage(payload: any): any
    toLLMMessage(payload: any): any
    clear(): void
    isEmpty(): boolean
}

/**
 * Creates a new trackable message store with methods for managing messages.
 * @returns {TrackableMessageStore} A new message store instance
 */
export function createTrackableMessageStore(): TrackableMessageStore {
    const messages: TrackableMessage[] = []

    return {
        /**
         * Retrieves a message from the store by its unique ID.
         * @param {string} id - The unique identifier of the message
         * @returns {TrackableMessage | undefined} The found message or undefined if not found
         */
        get(id: string) {
            return messages.find(message => message.id === id)
        },

        /**
         * Returns all messages in the store.
         * @returns {TrackableMessage[]} An array of all stored messages
         */
        getAll() {
            return messages
        },

        /**
         * Retrieves the first message in the store.
         * @returns {TrackableMessage | undefined} The first message or undefined if store is empty
         */
        getFirst() {
            return messages[0]
        },

        /**
         * Retrieves the last message in the store.
         * @returns {TrackableMessage | undefined} The last message or undefined if store is empty
         */
        getLast() {
            return messages[messages.length - 1]
        },

        /**
         * Adds a message to the end of the store.
         * @param {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage} payload - The message or payload to append
         * @returns {TrackableMessage} The appended message
         */
        append(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage) {
            // check if the payload contains an id
            if ("id" in payload) {
                messages.push(payload as TrackableMessage)
                return payload as TrackableMessage
            } else {
                const message = this.fromLLMMessage(payload)
                messages.push(message)
                return message
            }
        },

        /**
         * Adds a message to the beginning of the store.
         * @param {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage} payload - The message or payload to prepend
         * @returns {TrackableMessage} The prepended message
         */
        prepend(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage) {
            if ("id" in payload) {
                messages.unshift(payload as TrackableMessage)
                return payload as TrackableMessage
            } else {
                const message = this.fromLLMMessage(payload)
                messages.unshift(message)
                return message
            }
        },

        /**
         * Inserts a message at a specific index in the store.
         * @param {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage} payload - The message or payload to inject
         * @param {number} index - The index at which to insert the message
         * @returns {TrackableMessage} The injected message
         */
        inject(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload> | TrackableMessage, index: number) {
            if ("id" in payload) {
                messages.splice(index, 0, payload as TrackableMessage)
                return payload as TrackableMessage
            } else {
                const message = this.fromLLMMessage(payload)
                messages.splice(index, 0, message)
                return message
            }
        },

        /**
         * Updates an existing message in the store.
         * @param {string} id - The unique identifier of the message to update
         * @param {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>} payload - The new payload for the message
         */
        update(id: string, payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) {
            const message = this.get(id)
            if (message) {
                message.payload = payload
                message.updatedAt = new Date()
            }
        },

        /**
         * Removes a message from the store by its ID.
         * @param {string} id - The unique identifier of the message to delete
         */
        delete(id: string) {
            const index = messages.findIndex(message => message.id === id)
            if (index !== -1) {
                messages.splice(index, 1)
            }
        },

        /**
         * Creates a trackable message from an LLM message payload.
         * @param {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>} payload - The LLM message payload
         * @returns {TrackableMessage} A new trackable message with generated metadata
         */
        fromLLMMessage(payload: Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>) {
            return {
                payload,
                id: randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        },

        /**
         * Creates a trackable message from a Discord message.
         * @param {DiscordMessage} payload - The Discord message to convert
         * @returns {TrackableMessage} A new trackable message with converted payload
         */
        fromDiscordMessage(payload: DiscordMessage) {
            return {
                payload: {
                    content: payload.content,
                    role: payload.author.bot ? "assistant" : "user"
                },
                id: randomUUID(),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        },

        /**
         * Converts a trackable message to its original LLM message payload.
         * @param {TrackableMessage} payload - The trackable message to convert
         * @returns {Exclude<Kimiko.LLM.MessagePayload, Kimiko.LLM.SystemMessagePayload>} The original LLM message payload
         */
        toLLMMessage(payload: TrackableMessage) {
            return payload.payload
        },

        /**
         * Removes all messages from the store.
         */
        clear() {
            messages.length = 0
        },

        /**
         * Checks if the message store is empty.
         * @returns {boolean} True if no messages are in the store, false otherwise
         */
        isEmpty() {
            return messages.length === 0
        }
    }
}