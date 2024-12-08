import { Kimiko } from "@kimiko";
import { PersonalityAgent } from "./PersonalityAgent";
// Create a new instance of the Discord client
const client = Kimiko.Core.Client;

// load the PersonalityAgent and register its events
PersonalityAgent.registerEvents();

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);