import { Client, GatewayIntentBits } from 'discord.js'
import { config as DotEnvConfig } from 'dotenv'
// set up environment vars.
DotEnvConfig()

const intents = [
    GatewayIntentBits.DirectMessagePolls,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
]

export class KimikoClient extends Client {
    private static _instance: KimikoClient
    private constructor() {
        super({ intents })
    }

    public static getInstance(): KimikoClient {
        if (KimikoClient._instance === undefined)
            KimikoClient._instance = new KimikoClient()
        return KimikoClient._instance
    }
    
    public static login() {
        KimikoClient.getInstance().login(process.env.DISCORD_APP_TOKEN)
    }
}
