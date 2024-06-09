import { KimikoRC } from "./types";

const config: KimikoRC = {
    "logging_default": {
        "logToFile": false,
        "logToConsole": true,
        "logFilePath": "logs/"
    },
    "plugins": [
        {
            "name": "example-plugin",
            "path": "example-plugin",
            "enabled": true,
			"log_overrides": {
				"logToFile": false,
				"logToConsole": false
			}
        }
    ],
    "intents": ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"]
}

export { config };
