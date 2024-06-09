import { Client, Events } from "discord.js";
class MyPlugin  {
    // myPlugin is a kimiko plugin, it will be loaded by the KimikoLoader 
    // when loaded successfully, the KimikoLoader will emit the event "${pluginname}:onload"
    // which you can listen to. the pluginname can be obtained from the package.json
    // alternatively, you can define an onLoad function in your plugin class

    constructor(client: Client, config: Record<string, any>) {
        // do something with the client and the config
        client.on(Events.MessageCreate, (message) => {
            if (message.content === "!ping") {
                message.reply("Pong!");
            }
        });

        client.on("example-plugin:onload", (client) => {
            console.log("MyPlugin loaded!");
        });
    }
    public onLoad(client: Client) {
        console.log("MyPlugin loaded!");
    } // as long as this is defined the event listener above will not be called, if not defined the loader will emit the event and call the listener

}

export default MyPlugin;