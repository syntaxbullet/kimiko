import { Kimiko } from "./Kimiko";

const client = new Kimiko.Client();

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);
