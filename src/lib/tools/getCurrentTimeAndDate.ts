import { Kimiko } from "@kimiko"

const def =  {
    function: {
        name: 'getCurrentTimeAndDate',
        description:
            'Returns the current time and date in a human-readable format.',
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
    const date = new Date()
    const time = date.toLocaleTimeString()
    const day = date.toLocaleDateString()
    return {
        role: 'tool',
        content: `Current time and date: ${time} on ${day}`,
        tool_call_id: message.tool_calls[0].id,
    } as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
}

export default { def, handle }