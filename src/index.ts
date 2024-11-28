// Import necessary modules and configurations
import { Client, IntentsBitField, Events, Message, Partials, GatewayIntentBits } from 'discord.js';
import { KimikoAgent } from './KimikoAgent';
import { KimikoClient } from './KimikoClient';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

// Constants and Configuration
const SYSTEM_PROMPT = "You are to assume the role of Kimiko, the user's personal assistant.";
const TARGET_USER_ID = '109998942841765888'; // Consider moving to environment variables for flexibility
const DEFAULT_TOOLS: any = [
    {
        function: {
            name: 'clearChat',
            description: 'Clears the assistant\'s messages in the chat',
            parameters: {},
        },
        type: "function",
    },
];

// Initialize KimikoClient and KimikoAgent
const bot = KimikoClient.getInstance();
const agent = new KimikoAgent(SYSTEM_PROMPT); // Enable debug based on environment variable

// Tool Handlers Mapping
const toolHandlers: Record<string, (msg: Message, args?: string) => Promise<void>> = {
    clearChat: clearChat,
    // Add more tool handlers here as your bot expands
};

// Event: Client Ready
bot.once(Events.ClientReady, async (client: Client) => {
    try {
        const user = await client.users.fetch(TARGET_USER_ID);
        await user.send('Hello!');
        await client.user?.setPresence({ status: 'online' });
        console.log(`Logged in as ${client.user?.tag}!`);
    } catch (error) {
        console.error('Error during ClientReady event:', error);
    }
});

// Event: Message Create
bot.on(Events.MessageCreate, async (msg: Message) => {
    // Ignore messages from bots to prevent feedback loops
    if (msg.author.bot) return;

    // Ensure the channel is text-based and sendable
    if (!msg.channel.isTextBased() || !msg.channel.isSendable()) return;

    try {
        // Add the incoming message to the agent's context
        await agent.addMessage(msg);
        const tokenCount = agent.getCurrentTokenCount();
        console.log(`Token Count: ${tokenCount}`);

        // Indicate that the bot is processing
        await msg.channel.sendTyping();

        // Prepare the completion request payload
        const completionPayload = {
            tools: DEFAULT_TOOLS,
            parallel_tool_calls: false,
        };

        // Send completion request to the agent
        const response = await agent.sendCompletion(completionPayload);

        // Handle the response based on the finish reason
        if (response.choices[0].finish_reason === 'tool_calls' && response.choices[0].message.tool_calls) {
            const calledTools = response.choices[0].message.tool_calls;
            for (const tool of calledTools) {
                const toolName = tool.function.name;
                const toolArgs = tool.function.arguments;
                const handler = toolHandlers[toolName];
                if (handler) {
                    await handler(msg, toolArgs);
                } else {
                    console.warn(`No handler found for tool: ${toolName}`);
                }
            }
        } else if (response.choices[0].finish_reason === 'stop') {
            const assistantMessage = response.choices[0].message.content;
            if (assistantMessage) {
                await msg.channel.send(assistantMessage);
            } else {
                console.warn('Received an empty assistant message.');
            }
        } else {
            console.warn(`Unhandled finish reason: ${response.choices[0].finish_reason}`);
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await msg.channel.send('An error occurred while processing your request.');
    }
});

// Function: Call Tool
async function callTool(msg: Message, name: string, args?: string): Promise<void> {
    const parsedArgs = args ? JSON.parse(args) : {};

    const handler = toolHandlers[name];
    if (handler) {
        await handler(msg, JSON.stringify(parsedArgs));
    } else {
        console.warn(`No handler implemented for tool: ${name}`);
    }
}

// Function: Clear Chat
async function clearChat(message: Message, args?: string): Promise<void> {
    try {
        const fetchedMessages = await message.channel.messages.fetch({ limit: 100 }); // Fetch last 100 messages
        const deletableMessages = fetchedMessages.filter(msg => msg.deletable && msg.author.id === bot.user?.id);
        
        if (deletableMessages.size === 0) {
            return;
        }

        for (const [_, msg] of deletableMessages) {
            await msg.delete().catch(err => console.error(`Failed to delete message: ${err}`));
        }

    } catch (error) {
        console.error('Error in clearChat:', error);
    }
}

// Handle Graceful Shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    bot.destroy();
    process.exit();
});

// Login to Discord with the bot token
const DISCORD_TOKEN = process.env.DISCORD_APP_TOKEN;
if (!DISCORD_TOKEN) {
    console.error('Error: DISCORD_TOKEN is not defined in environment variables.');
    process.exit(1);
}

bot.login(DISCORD_TOKEN).catch(error => {
    console.error('Failed to login:', error);
    process.exit(1);
});
