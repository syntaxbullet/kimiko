import { Kimiko } from "./types";
import { randomUUID } from "node:crypto";

class KimikoConversationalContextProvider implements Kimiko.Core.IConversationalContextProvider {
    private messages: Kimiko.Core.TrackableConversationMessage[] = [];

    get(id: string): Kimiko.Core.TrackableConversationMessage | undefined {
        return this.messages.find((message) => message.id === id);
    }

    getAll(): Kimiko.Core.TrackableConversationMessage[] {
        return this.messages;
    }

    set(messages: Kimiko.Core.TrackableConversationMessage[]): void {
        this.messages = messages;
    }

    append(message: Kimiko.Core.TrackableConversationMessage | Kimiko.LLM.MessagePayload): void {
        if ('id' in message) {
            this.messages.push(message);
        } else {
            (message as Kimiko.Core.TrackableConversationMessage).id = randomUUID();
            (message as Kimiko.Core.TrackableConversationMessage).createdAt = Date.now();
            (message as Kimiko.Core.TrackableConversationMessage).updatedAt = Date.now();
            this.messages.push(message as Kimiko.Core.TrackableConversationMessage);
        }

    }

    prepend(message: Kimiko.Core.TrackableConversationMessage | Kimiko.LLM.MessagePayload): void {
        if ('id' in message) {
            this.messages.unshift(message);
        } else {
            (message as Kimiko.Core.TrackableConversationMessage).id = randomUUID();
            (message as Kimiko.Core.TrackableConversationMessage).createdAt = Date.now();
            (message as Kimiko.Core.TrackableConversationMessage).updatedAt = Date.now();
            this.messages.unshift(message as Kimiko.Core.TrackableConversationMessage);
        }
    }

    remove(id: string): void {
        this.messages = this.messages.filter((message) => message.id !== id);
    }

    edit(id: string, message: Kimiko.Core.TrackableConversationMessage | Kimiko.LLM.MessagePayload): void {
        const index = this.messages.findIndex((message) => message.id === id);
        if (index !== -1) {
            if ('id' in message) {
                this.messages[index] = message;
            } else {
                this.messages[index] = {
                    ...this.messages[index],
                    ...message,
                    updatedAt: Date.now(),
                };
            }
        }
    }

    clear(): void {
        this.messages = [];
    }
}

export default KimikoConversationalContextProvider;