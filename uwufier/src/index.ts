import { Client, Message } from "discord.js";

const uwufier = {
    uwufy: (message: Message) => {
        if (message.author.bot) return;
        let text = message.content;
        text = text.replace(/(?:l|r)/g, 'w');
        text = text.replace(/(?:L|R)/g, 'W');
        text = text.replace(/!+/g, ` >w< `);
        let f = Math.random() < 0.25
        if (f) {
            let c = text.charAt(0)
            text = c + '-' + text
        }
        message.channel.send(text);
    },
    init: (client: Client) => {
        console.log('uwufier loaded');
        client.on('messageCreate', uwufier.uwufy);
    }
}

export default uwufier;