import { KimikoClient } from "./KimikoClient";
import { KimikoPluginManager } from "./KimikoPluginManager";
import { LogType } from "./KimikoLogger";
import dotenv from "dotenv";
import { Events } from "discord.js";

dotenv.config();

const client = KimikoClient.getInstance();
const logger = client.logger;
const loader = KimikoPluginManager.getInstance();

client.once(Events.ClientReady, () => {
    logger.log(LogType.INFO, "Kimiko is ready!");
    loader.loadPlugins();
});

client.login(process.env.DISCORD_TOKEN);