import { Client, Events } from 'discord.js'
import { Kimiko } from './Kimiko'
import fs from 'fs'
import path from 'path'
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

const TARGET_USER_ID = process.env.DISCORD_USER_ID;


const personalityPromptPath = path.join(process.cwd(), 'personality.md')

const client = new Kimiko.KimikoClient();

let BaseAgent = new Kimiko.KimikoAgent({
    model: 'llama-3.1-70b-specdec',
    max_tokens: 500,
    temperature: 0.3,
    messages: [
        {
            role: 'system',
            content: fs.readFileSync(personalityPromptPath, 'utf-8'),
        },
    ],
})

// add the logging decorator to the agent such that all messages are logged for debugging
const LoggingAgent = new Kimiko.Decorators.LoggingAgent(BaseAgent)
const PersonalityAgent = new Kimiko.Decorators.Context.UserProfile(LoggingAgent)
client.once(Events.ClientReady, async (client: Client) => {
    try {
        const user = await client.users.fetch(TARGET_USER_ID as string);
        await user.send('Hello!');
        await client.user?.setPresence({ status: 'online' });
        console.log(`Logged in as ${client.user?.tag}!`);
    } catch (error) {
        console.error('Error during ClientReady event:', error);
    }
});

client.on(Events.MessageCreate, async (message) => {
    PersonalityAgent.addMessage(message);
    if (message.author.bot) return
    if (message.channel.isSendable()) {
        try {
            const response = await PersonalityAgent.send();
            await message.channel.send(response.choices[0].message.content);
        } catch (error) {
            console.error('Error during MessageCreate event:', error);
        }
    }
})

client.login()