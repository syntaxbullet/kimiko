import { KimikoClient } from "./KimikoClient";
import { Events, Message } from 'discord.js'

const userId = "109998942841765888"

const instance = KimikoClient.getInstance()

instance.once(Events.ClientReady, async (client) => {
    const user = await client.users.fetch(userId)
    user.send("Hello!")
    client.user.presence.set({ status: "online"})
})

instance.on(Events.MessageCreate, (message) => {
    if (message.author.bot) return
    if (message.content === "clear") return clearMessages(message)
    message.reply("Reply!")
})

async function clearMessages(message: Message) {
    // get the dm channel
    const dmchannel = message.channel;
    const messagesInChannel = await (await dmchannel.messages.fetch({ limit: 100 })).filter(message => message.author.bot)
    messagesInChannel.map(message => message.delete())
    message.react("✅")
}
KimikoClient.login()

