import { Events, Message } from 'discord.js';
import { KimikoClient } from './KimikoClient';
import KimikoPersonalityAgent from './KimikoPersonalityAgent';

const bot = new KimikoClient();

// Function to handle bot readiness
const handleClientReady = async (client: KimikoClient) => {
    try {
        const userId = process.env.DISCORD_USER_ID as string;
        const user = await client.users.fetch(userId);
        await user.send('Hello!');
    } catch (error) {
        console.error('Error during ClientReady event:', error);
    }
};

// Function to handle incoming messages
const handleMessageCreate = async (message: Message) => {
    try {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Add message to the personality agent
        KimikoPersonalityAgent.addMessage(message);

        // Get response from personality agent
        const response = await KimikoPersonalityAgent.send();
        
        // Send response if the channel is sendable
        if (message.channel.isSendable()) {
            const responseMessage = response.choices[0].message.content;
            await message.channel.send(responseMessage);
        }
    } catch (error) {
        console.error('Error handling message:', error);
    }
};

// Graceful exit function to handle shutdown signals
const gracefulExit = () => {
    console.log('Gracefully shutting down...');
    if (bot.isReady()) {
        bot.destroy();
    }
    process.exit(0);
};

// Register event handlers
bot.once(Events.ClientReady, handleClientReady);
bot.on(Events.MessageCreate, handleMessageCreate);

// Login the bot using token
bot.login();

// Listen for termination signals to gracefully exit
process.on('SIGINT', gracefulExit);  // Catch Ctrl+C
process.on('SIGTERM', gracefulExit); // Catch kill command

