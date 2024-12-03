import { Kimiko } from './Kimiko';
import { config as dotenvConfig } from 'dotenv';

// Load environment variables as early as possible
dotenvConfig();

// create a new client
const client = new Kimiko.Client();

// create a new basic agent
const agent = new Kimiko.Agent({
    model: 'llama-3.1-70b-specdec',
    messages: [{role: 'system', content: 'You are a helpful assistant.'}],
    tools: [],
    temperature: 0.2,
    max_tokens: 1000,
});
// login to Discord with your bot token
client.login();