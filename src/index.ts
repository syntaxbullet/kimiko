import { KimikoClient } from "./KimikoClient";
import { KimikoPluginManager } from "./KimikoPluginManager";
import { logColors, logType } from "./types";
import dotenv from "dotenv";
import { Events } from "discord.js";

dotenv.config();

const client = KimikoClient.getInstance();
const logger = client.logger;
const loader = KimikoPluginManager.getInstance();

client.once(Events.ClientReady, () => {
    logger.log(logType.INFO, logColors.GREEN, "Kimiko is ready!");
    loader.loadPlugins();
});

client.login(process.env.DISCORD_TOKEN);