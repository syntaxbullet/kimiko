import { Kimiko } from "@kimiko"
import fs from 'fs'
import path from 'path'

const def =  {
    function: {
        name: 'getUserProfile',
        description:
            'Returns the current user profile.',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
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
    const profile = fs.readFileSync(path.join(process.cwd(), 'userprofile.kimiko.json'), 'utf-8')
    return {
        role: 'tool',
        content: 'Tool call successful! Here is the user profile:\n' + profile,
        tool_call_id: message.tool_calls[0].id,
    } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
}

export default { def, handle }