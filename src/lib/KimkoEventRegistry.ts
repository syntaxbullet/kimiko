import { Kimiko } from "@kimiko";
import { EventEmitter } from "events";

export class KimikoEventRegistry implements Kimiko.Core.IEventRegistry {

    public responders: Kimiko.Core.IEventResponder[] = [];
    public emitter: EventEmitter

    constructor(emitter: EventEmitter) {
        this.emitter = emitter;
    }

    register(responder: Kimiko.Core.IEventResponder): void {
        this.responders.push(responder);
        responder.registerEvents(this.emitter);
    }
    unregister(responder: Kimiko.Core.IEventResponder): void {
        this.responders = this.responders.filter((r) => r.id !== responder.id);
    }
    broadcast(event: string, data: any): void {
       this.emitter.emit(event, data);
    }
}