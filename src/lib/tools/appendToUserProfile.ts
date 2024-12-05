import { Kimiko } from "@kimiko"
import fs from 'fs'
import path from 'path'

const def =  {
    function: {
        name: 'appendToUserProfile',
        description:
            'Appends a memorable piece of information to the user profile.',
        parameters: {
            type: 'object',
            properties: {
               "category": { type: "string", enum: ['information', 'note', 'preference'], description: 'The category of the content.' },
               "content": { type: "string", description: 'The content to append.' },
            },
            required: ['category', 'content'],
        },
    },
    type: 'function',
} as Kimiko.Types.Groq_LLM.LLMTool

function generateID(): string {
    // generate a short 5 character ID
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/'
    let id = ''
    for (let i = 0; i < 5; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return id
}

function handle (
    message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload
) {
    if (!message.tool_calls || message.tool_calls.length === 0) {
        throw new Error('No tool calls found in message')
    }
    const args = JSON.parse(message.tool_calls[0].function.arguments)
    if (!args.category || !args.content) {
        return {
            role: 'tool',
            content: 'Tool call failed: Missing category or content in arguments',
            tool_call_id: message.tool_calls[0].id,
        } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
    }
    const profile = fs.readFileSync(path.join(process.cwd(), 'userprofile.kimiko.json'), 'utf-8')
    const newProfile = JSON.parse(profile)
    const newEntry = {
        id: generateID(),
        category: args.category,
        content: args.content,
    }
    newProfile.profile.push(newEntry)
    fs.writeFileSync(path.join(process.cwd(), 'userprofile.kimiko.json'), JSON.stringify(newProfile, null, 2))
    return {
        role: 'tool',
        content: 'Tool call successful! Here is the updated user profile:\n' + JSON.stringify(newProfile, null, 2),
        tool_call_id: message.tool_calls[0].id,
    } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
}

export default { def, handle }