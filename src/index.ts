import { Kimiko } from "@kimiko/types";
// Create a new instance of the Discord client
const client = Kimiko.Core.Client;


// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);