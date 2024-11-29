// Import necessary modules and configurations
import { Client, Message, Events } from 'discord.js';
import { KimikoAgent } from './KimikoAgent';
import { KimikoClient } from './KimikoClient';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables from .env file
dotenvConfig();