import path from "path";
import fs from "fs";

import KimikoLogger from "./KimikoLogger";

class KimikoLoader {
    public static load() {
        // 1. look for a plugin.json file in the project root, if it exists, load the plugins from there, if not create it and return an empty array
        // 2. look at each key if the json file provided and load the plugin from the path provided
        // 3. return the plugins array containing the key and the loaded plugin as an object
        const plugins: Record<string, string> = {};
        const pluginPath = path.join(process.cwd(), 'plugins.json');
        if (!fs.existsSync(pluginPath)) {
            fs.writeFileSync(pluginPath, JSON.stringify({}));
        }
        const pluginJson = JSON.parse(fs.readFileSync(pluginPath, 'utf-8'));
        for (const key in pluginJson) {
            try {
                plugins[key] = require(path.join(process.cwd(), pluginJson[key]));
                KimikoLogger.info(`Loaded plugin ${key} from path ${pluginJson[key]}`);
            }
            catch (e) {
                KimikoLogger.error(`Failed to load plugin ${key} from path ${pluginJson[key]}`);
            }
        }
        return plugins;

    }
}

export default KimikoLoader;