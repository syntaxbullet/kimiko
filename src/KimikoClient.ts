import { Client, GatewayIntentBits } from "discord.js";
import { KimikoLogger } from "./KimikoLogger";
import { KimikoRC } from "./types";
import fs from "fs";
import path from "path";

/**
 * Represents a client for the Kimiko application.
 */
class KimikoClient extends Client {
    private config: KimikoRC;
    public logger: KimikoLogger = KimikoLogger.getInstance();

    private static loadConfigFile(): KimikoRC {
        try {
            const configFile = fs.readFileSync(path.join(__dirname, "../kimikorc.json"), "utf-8");
            return JSON.parse(configFile);
        } catch (error: any) {
            throw new Error("Failed to load config file: " + error.message);
        }
    }

    private static instance: KimikoClient;

    public static getInstance(): KimikoClient {
        if (!KimikoClient.instance) {
            const config = KimikoClient.loadConfigFile();
            KimikoClient.instance = new KimikoClient(config);
        }
        return KimikoClient.instance;
    }

    public getConfig(): KimikoRC {
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