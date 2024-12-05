import { Kimiko } from "@kimiko"
import fs from 'fs'
import path from 'path'

const def =  {
    function: {
        name: 'updateUserProfileEntry', 
        description:
            'Updates a specific entry in the user profile.',
        parameters: {
            type: 'object',
            properties: {
               "id": { type: "string", description: 'The ID of the entry to update.' },
               "category": { type: "string", enum: ['information', 'note', 'preference'], description: 'The category of the content.' },
               "content": { type: "string", description: 'The content to update.' },
            },
            required: ['id', 'category', 'content'],
        },
    },
    type: 'function',
} as Kimiko.Types.Groq_LLM.LLMTool


function handle (
    message: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload
) {
    if (!message.tool_calls || message.tool_calls.length === 0) {
        throw new Error('No tool calls found in message')
    }
    const args = JSON.parse(message.tool_calls[0].function.arguments)
    if (!args.category || !args.content || !args.id) {
        return {
            role: 'tool',
            content: 'Tool call failed: Missing category, content, or id in arguments',
            tool_call_id: message.tool_calls[0].id,
        } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
    }
    const profile = fs.readFileSync(path.join(process.cwd(), 'userprofile.kimiko.json'), 'utf-8')
    const newProfile = JSON.parse(profile)
    // find the entry to update
    const entryIndex = newProfile.profile.findIndex((entry: any) => entry.id === args.id)
    if (entryIndex === -1) {
        return {
            role: 'tool',
            content: 'Tool call failed: Entry not found in user profile',
            tool_call_id: message.tool_calls[0].id,
        } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
    }
    // update the entry
    newProfile.profile[entryIndex] = {
        id: args.id,
        category: args.category,
        content: args.content,
    }
    fs.writeFileSync(path.join(process.cwd(), 'userprofile.kimiko.json'), JSON.stringify(newProfile, null, 2))
    return {
        role: 'tool',
        content: 'Tool call successful! Here is the updated user profile:\n' + JSON.stringify(newProfile, null, 2),
        tool_call_id: message.tool_calls[0].id,
    } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
}

export default { def, handle }