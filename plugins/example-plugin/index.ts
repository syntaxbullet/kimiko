import { Client, Events } from "discord.js";

class MyPlugin  {
    private logger: any;
    constructor(client: Client, logger: any) {
        this.logger = logger;
        // do something with the client and the config
        client.on(Events.MessageCreate, (message) => {
            if (message.content === "!ping") {
                message.reply("Pong!");
            }
        });
    }
    public onLoad(...dependencies: any[]) {
        this.logger.log("DEBUG", "MyPlugin loaded!");
    } // as long as this is defined the event listener above will not be called, if not defined the loader will emit the event and call the listener

}

export default MyPlugin;