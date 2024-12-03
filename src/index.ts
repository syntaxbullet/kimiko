import { config as dotenvConfig } from "dotenv";
import { Kimiko } from "./Kimiko";
import { Events, Message } from "discord.js";

// Load environment variables as early as possible
dotenvConfig();

// Default LLM configuration
const llm_config: Kimiko.Types.Groq_LLM.LLMRequestBody = {
    model: "llama-3.1-70b-specdec",
    messages: [
        { 
            role: "system", 
            content: "You are a helpful assistant." 
        }
    ],
    temperature: 0.7,
    max_tokens: 500,
    tools: []
};

/**
 * Converts a Discord message to the format expected by the LLM
 * @param message - The Discord message to convert
 * @returns A formatted message payload for the LLM
 */
const convertDiscordMessageToLLMMessage = (
    message: Message
): Kimiko.Types.Groq_LLM.LLMMessagePayload => ({
    role: message.author.bot ? "assistant" : "user",
    content: message.content,
});

// Initialize Kimiko components
const client = new Kimiko.Client();
const contextManager = new Kimiko.ContextManager();
const toolManager = new Kimiko.ToolManager();
const configManager = new Kimiko.ConfigManager(
    llm_config, 
    contextManager, 
    toolManager
);
const agent = new Kimiko.Agent(configManager, contextManager, toolManager);

// Handle incoming Discord messages
client.on(Events.MessageCreate, async (message) => {
    // Add message to conversation context
    contextManager.append(convertDiscordMessageToLLMMessage(message));
    
    // Skip if message is from a bot
    if (message.author.bot) return;
    
    // Get LLM response and send it back
    const response = await agent.send();
    message.channel.send(response.choices[0].message.content);
});

// Start the Discord bot
client.login(process.env.DISCORD_APP_TOKEN);
