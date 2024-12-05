import { Kimiko } from "@kimiko";
import KimikoAgent from "./Kimiko";

// Create a new instance of the Discord client
const client = Kimiko.Client;

// register event handlers for the kimiko agent
KimikoAgent.registerEventHandlers();

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);
