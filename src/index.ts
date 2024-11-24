import { kimikoClient } from "./KimikoClient";
import { kimikoScheduler } from "./KimikoScheduler";
import { Events, Message, OmitPartialGroupDMChannel } from 'discord.js'


const in1min = Date.now() + (1 * 6 * 1000);

const userId = "109998942841765888"


kimikoClient.once(Events.ClientReady, async (client) => {
    const user = await client.users.fetch(userId)
    user.send("Hello!")
    client.user.presence.set({ status: "online"})
})

function handleMessage(message: OmitPartialGroupDMChannel<Message<boolean>>): void {
    if (message.author.bot) return
    kimikoScheduler.scheduleEvent(new Date(in1min).toISOString())
    console.log("scheduled at:", new Date().toISOString())
    kimikoScheduler.on("check-in", (e) => { message.reply(`ding dong! {${new Date().toISOString()}}`) })
}

kimikoClient.on(Events.MessageCreate, (message) => handleMessage(message))
kimikoClient.login()

