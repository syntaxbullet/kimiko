import { Client, GatewayIntentBits, Events } from "discord.js";
import { config as dotenvConfig } from 'dotenv';

// Load environment variables as early as possible
dotenvConfig();

export class KimikoClient extends Client {
    constructor() {
        super({
            intents: [
                GatewayIntentBits.DirectMessages,
                GatewayIntentBits.DirectMessageReactions,
                GatewayIntentBits.DirectMessageTyping,
                GatewayIntentBits.DirectMessagePolls,
                GatewayIntentBits.MessageContent
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