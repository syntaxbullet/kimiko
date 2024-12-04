import { Kimiko } from "@kimiko";

// Create a new instance of the PersonalityAgent
const client = Kimiko.Client;

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);
