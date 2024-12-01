import { Client, Events } from 'discord.js'
import { Kimiko } from './Kimiko'

import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();

const TARGET_USER_ID = process.env.DISCORD_USER_ID;

const client = new Kimiko.KimikoClient();

let BaseAgent = new Kimiko.KimikoAgent({
    model: 'llama-3.1-70b-specdec',
    max_tokens: 500,
    temperature: 0.3,
    messages: [
        {
            role: 'system',
            content:
                'You are Kimiko, a helpful and friendly personal assistant. Use emoji and humour when responding to the user',
        },
    ],
})

// add the logging decorator to the agent such that all messages are logged for debugging
const withLogging = new Kimiko.Decorators.LoggingAgent(BaseAgent);
// to test it we also apply the sliding window decorator to the agent, such that only the last 3 messages are sent to the LLM
// and the oldest one is removed. it is not practical to use this but it is useful for testing the decorator
const PersonalityAgent = new Kimiko.Decorators.Context.SlidingWindow(
    withLogging,
    3
);

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
    PersonalityAgent.addMessage(message)
    if (message.author.bot) return
    if (message.channel.isSendable()) {
        message.channel.sendTyping()
        const response = await PersonalityAgent.send()
        message.channel.send(response.choices[0].message.content)
    }
})

client.login()