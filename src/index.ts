import { Kimiko } from "@kimiko";
import PersonalityAgent from "./PersonalityAgent";

// Create a new instance of the PersonalityAgent
const client = Kimiko.Client;

PersonalityAgent.registerEventHandlers();

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);
