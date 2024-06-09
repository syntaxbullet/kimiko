import { Client, GatewayIntentBits } from "discord.js";
import { KimikoLogger } from "./KimikoLogger";
import { KimikoRC } from "./types";
import { config } from "./kimikorc";

/**
 * Represents a client for the Kimiko application.
 */
class KimikoClient extends Client {
    private config: KimikoRC;
    public logger: KimikoLogger = new KimikoLogger(null);

    private static instance: KimikoClient;

    public static getInstance(): KimikoClient {
        if (!KimikoClient.instance) {
            KimikoClient.instance = new KimikoClient(config);
        }
        return KimikoClient.instance;
    }

    public getConfig(): KimikoRC {
		// TODO: Check if this returns a copy or a reference
        return this.config;
    }

    private constructor(config: KimikoRC) {
        super({
            intents: config.intents.map((intent: string) => (GatewayIntentBits as any)[intent])
        });
        this.config = config;
    }
}

export { KimikoClient };
