import KimikoClient from "@core/KimikoClient";

import dotenv from 'dotenv';
dotenv.config();

KimikoClient.login(process.env.DISCORD_TOKEN);
