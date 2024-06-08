import { Client, GatewayIntentBits } from 'discord.js';
import KimikoLogger from '@core/KimikoLogger';
import KimikoLoader from '@core/KimikoLoader';

interface KimikoClientOptions {
    intents: GatewayIntentBits[];
    logger: typeof KimikoLogger;
    [key: string]: any; // this allows us to extend the class with more properties via the options object
}

class KimikoClient extends Client {

    public logger!: typeof KimikoLogger;

    constructor(options: KimikoClientOptions) {
        super({ intents: options.intents });
        // load plugins
        Object.assign(this, KimikoLoader.load());
        Object.assign(this, options);
        console.log(this);
        this.once('ready', () => {
            this.logger.debug('Kimiko is ready!');
        });
    }
}

export default new KimikoClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
    ],
    logger: KimikoLogger,
});