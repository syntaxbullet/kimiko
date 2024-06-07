// Require the necessary discord.js classes
import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';

// Load the environment variables
dotenv.config();
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, client => {
	console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
