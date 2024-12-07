import { Kimiko } from "@kimiko";
import { ExampleAgent } from "./ExampleAgent";
// Create a new instance of the Discord client
const client = Kimiko.Core.Client;
const eventRegistry = Kimiko.Core.EventRegistry

const agent = new ExampleAgent();

eventRegistry.register(agent);

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);