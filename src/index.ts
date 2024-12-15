import { KimikoClient } from "./KimikoClient";
import { config as dotenvConfig } from "dotenv";

// Load environment variables as early as possible
dotenvConfig()

const client = new KimikoClient();

client.login()