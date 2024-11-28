import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Represents a scheduled event with its timeout and scheduled time.
 */
interface ScheduledEvent {
    timeout: NodeJS.Timeout;
    eventTime: Date;
}

/**
 * KimikoScheduler class provides methods to schedule, update, and cancel events.
 * It emits a 'check-in' event when a scheduled event occurs.
 */
export class KimikoScheduler extends EventEmitter {
    private events: Map<string, ScheduledEvent>;

    constructor() {
        super();
        this.events = new Map();
    }

    /**
     * Schedules an event to emit a 'check-in' at the specified ISO timestamp.
     * @param isoTimestamp - The ISO timestamp at which to emit the event.
     * @returns The unique ID of the scheduled event.
     * @throws Will throw an error if the timestamp is invalid or in the past.
     */
    public scheduleEvent(isoTimestamp: string): string {
        const eventTime = new Date(isoTimestamp);

        if (isNaN(eventTime.getTime())) {
            throw new Error(`Invalid ISO timestamp: ${isoTimestamp}`);
        }

        const currentTime = new Date();

        if (eventTime <= currentTime) {
            throw new Error('Cannot schedule events in the past.');
        }

        const id = uuidv4();

        this.createTimeout(id, eventTime);

        return id;
    }

    /**
     * Updates the scheduled time of an existing event.
     * @param id - The unique ID of the event to update.
     * @param newIsoTimestamp - The new ISO timestamp at which to emit the event.
     * @throws Will throw an error if the event ID does not exist or the timestamp is invalid.
     */
    public updateEvent(id: string, newIsoTimestamp: string): void {
        if (!this.events.has(id)) {
            throw new Error(`Event with ID '${id}' does not exist.`);
        }

        const eventTime = new Date(newIsoTimestamp);

        if (isNaN(eventTime.getTime())) {
            throw new Error(`Invalid ISO timestamp: ${newIsoTimestamp}`);
        }

        const currentTime = new Date();

        if (eventTime <= currentTime) {
            throw new Error('Cannot schedule events in the past.');
        }

        const eventData = this.events.get(id)!;
        clearTimeout(eventData.timeout);

        this.createTimeout(id, eventTime);
    }

    /**
     * Cancels a scheduled event.
     * @param id - The unique ID of the event to cancel.
     * @throws Will throw an error if the event ID does not exist.
     */
    public cancelEvent(id: string): void {
        if (!this.events.has(id)) {
            throw new Error(`Event with ID '${id}' does not exist.`);
        }

        const eventData = this.events.get(id)!;
        clearTimeout(eventData.timeout);
        this.events.delete(id);
    }

    /**
     * Retrieves all scheduled events.
     * @returns A map of event IDs to their scheduled times.
     */
    public getScheduledEvents(): Map<string, Date> {
        const scheduledEvents = new Map<string, Date>();
        this.events.forEach((value, key) => {
            scheduledEvents.set(key, value.eventTime);
        });
        return scheduledEvents;
    }

    /**
     * Creates a timeout for the event and stores it.
     * @param id - The unique ID of the event.
     * @param eventTime - The time at which to emit the event.
     */
    private createTimeout(id: string, eventTime: Date): void {
        const MAX_DELAY = 2147483647; // Maximum delay for setTimeout in milliseconds
        const currentTime = new Date();
        let delay = eventTime.getTime() - currentTime.getTime();

        const schedule = (remainingDelay: number) => {
            const timeout = setTimeout(() => {
                if (remainingDelay > MAX_DELAY) {
                    // If there's still more time, schedule the next timeout
                    schedule(remainingDelay - MAX_DELAY);
                } else {
                    // Final timeout, emit the event
                    this.emit('check-in', { id, scheduledTime: eventTime });
                    this.events.delete(id);
                }
            }, Math.min(remainingDelay, MAX_DELAY));

            this.events.set(id, { timeout, eventTime });
        };

        schedule(delay);
    }
}