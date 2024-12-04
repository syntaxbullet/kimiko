import { Kimiko } from "@kimiko";
import { Message } from "discord.js";
import { config as dotEnvConfig } from "dotenv";

dotEnvConfig();

/**
 * System message defining Kimiko's personality and response style.
 * This guides the LLM in generating responses that are friendly, contextual, and appropriately casual or formal.
 */
const systemMessage =`
Craft friendly and engaging messages as Kimiko, the user's personal assistant. 
Use the provided context to tailor each message to the user's situation, making them cute and inviting. 
Balance seriousness and humor based on the context and the user's preferences.

Present the message in short sentences, incorporating both cute and friendly language. 
Use emojis if appropriate to enhance the message's warmth and personality.
Avoid using them when the context is serious.
`

/**
 * Configuration for the LLM model used by the personality agent.
 * Uses a lower temperature for more consistent responses while maintaining some creativity.
 */
const config: Kimiko.Types.Groq_LLM.LLMRequestBody = {
    model: "llama-3.1-70b-specdec",
    messages: [{ role: "system", content: systemMessage }],
    temperature: 0.2,
    max_tokens: 500,
};

// Initialize the core components for the personality agent
const configManager = new Kimiko.ConfigManager(config);
const contextManager = new Kimiko.ContextManager();
const toolManager = new Kimiko.ToolManager();

/**
 * The main agent instance that handles message processing and response generation.
 * Uses the Discord client for event handling and communication.
 */
const agent = new Kimiko.Agent(configManager, contextManager, toolManager, Kimiko.Client);

/**
 * Registers event handlers for the personality agent.
 * Sets up listeners for Discord message events and routes them to appropriate handlers.
 */
const registerEventHandlers = () => {
    Kimiko.Client.on('messageCreate', async (message) => {
        handleMessageCreate(message);
    });
}

/**
 * Converts a Discord message to the format expected by the LLM.
 * 
 * @param message - The Discord message to convert
 * @returns A formatted message payload for the LLM
 */
const convertDiscordMessageToLLMMessage = (message: Message): Kimiko.Types.Groq_LLM.LLMMessagePayload => {
    return {
        role: message.author.bot ? "assistant" : "user",
        content: message.content,
    };
}

/**
 * Handles incoming Discord messages.
 * Processes the message, generates a response using the LLM, and sends it back to the channel.
 * 
 * @param message - The Discord message to process
 */
const handleMessageCreate = async (message: Message) => {
    // Add the message to the agent's context
    agent.getContextManager().append(convertDiscordMessageToLLMMessage(message));

    // Don't respond to bot messages to avoid loops
    if (message.author.bot) return;

    // Generate and send response
    const response = await agent.send();
    if (!message.channel.isSendable()) return;
    
    // Show typing indicator for more natural interaction
    message.channel.sendTyping();
    message.channel.send(response.choices[0].message.content);
}

export default { registerEventHandlers }