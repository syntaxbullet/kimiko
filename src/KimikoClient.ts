import { Client, GatewayIntentBits, Events } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { KimikoScheduler } from './KimikoScheduler';
import { KimikoMemoryAgent } from './KimikoMemoryAgent';

// Load environment variables as early as possible
dotenvConfig();

/**
 * KimikoClient class extends the Discord.js Client with predefined intents.
 * It provides a singleton instance for the application.
 */
export class KimikoClient extends Client {
    private static instance: KimikoClient;
    
    public scheduler: KimikoScheduler = new KimikoScheduler();
    public memory: KimikoMemoryAgent = new KimikoMemoryAgent();
    /**
     * Creates an instance of KimikoClient with specified intents.
     * The constructor is private to enforce the singleton pattern.
     */
    private constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessagePolls,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMessageTyping,
                GatewayIntentBits.GuildMessages
            ],
        });
        // Handle the 'ready' event
        this.once(Events.ClientReady, () => {
            console.log(`Logged in as ${this.user?.tag}!`);
        });

        // Handle errors
        this.on(Events.Error, (error) => {
            console.error('Discord client error:', error);
        });
    }

      /**
     * Retrieves the singleton instance of KimikoClient.
     * @returns The KimikoClient instance.
     */
      public static getInstance(): KimikoClient {
        if (!KimikoClient.instance) {
            KimikoClient.instance = new KimikoClient();
        }
        return KimikoClient.instance;
    }

    /**
     * Logs in to Discord using the bot token.
     * @param token - The bot token to log in with. If not provided, uses DISCORD_APP_TOKEN from environment variables.
     * @returns A promise that resolves with the bot's token if the login is successful.
     * @throws Will throw an error if the bot token is missing or invalid.
     */
    public async login(token?: string): Promise<string> {
        const loginToken = token || process.env.DISCORD_APP_TOKEN;
        if (!loginToken) {
            throw new Error('DISCORD_APP_TOKEN environment variable is not set.');
        }

        try {
            const result = await super.login(loginToken);
            return result; // This is the bot's token
        } catch (error) {
            console.error('Failed to log in to Discord:', error);
            throw error;
        }
    }
}
