import { Kimiko } from '@kimiko'
import { AssistantMessagePayload, ToolCall, ToolMessagePayload } from '@kimiko/llm.types'
import { Message as DiscordMessage } from 'discord.js'

const SystemPrompt = `Craft friendly and engaging messages as Kimiko, the user's personal assistant. 
Use the provided context to tailor each message to the user's situation, making them cute and inviting. 
Balance seriousness and humor based on the context and the user's preferences.

Present the message in short sentences, incorporating both cute and friendly language. 
Use emojis if appropriate to enhance the message's warmth and personality.
Avoid using them when the context is serious.

You will be working with muliple other agents who's messages you will be able to see but the user will not be able to see them.
those agents are going to provide you with contextual information that you will use to tailor your response to the user's situation.
`
const Base = new Kimiko.Core.Agent(Kimiko.Core.Client)

Base.setInstruction({
    role: 'system',
    content: SystemPrompt,
})

Base.setConfig({
    model: 'llama-3.1-70b-versatile',
    max_tokens: 500,
    temperature: 0.3,
    tool_choice: 'none',
})

Base.setName('kimiko:personality')

Base.setEvents({
    emits: ['init', 'afterResponse'],
    listensTo: ['messageCreate'],
})

Base.registerEvents = () => {
    Base.emitter.emit(`${Base.name}::init`, createEmitterResponse({ agent: Base }))
    Base.emitter.on('messageCreate', handleMessageCreate)
}

const DisordMessageToLLMMessagePayload = (
    message: DiscordMessage
): Kimiko.LLM.AssistantMessagePayload | Kimiko.LLM.UserMessagePayload => {
    return {
        role: message.author.bot ? 'assistant' : 'user',
        content: message.content,
    }
}

const handleToolCall = async (response: Kimiko.LLM.ResponseBody) => {
    const toolMessage = response.choices[0].message as AssistantMessagePayload
    const toolCall = toolMessage.tool_calls as ToolCall[]

    for (const call of toolCall) {
        const args = JSON.parse(call.function.arguments)
        const name = call.function.name

        const handler = Base.toolHandlers.get(name)
        if (!handler) throw new Error(`No handler found for tool ${name}`)
        const toolResponse = await handler(...args)

        Base.appendMessage(toolResponse as ToolMessagePayload)
    }
}

const createEmitterResponse = (
    payload: any,
    recipient?: string,
    additionalInstructions?: string
): Kimiko.Core.EventResponderResponse => {
    return {
        id: Base.id,
        sender: Base.name,
        recipient: recipient,
        payload: payload,
        additionalInstructions: additionalInstructions,
    }
}

const handleSelfMessage = async (message: DiscordMessage) => {
    const llmMessage = DisordMessageToLLMMessagePayload(message)
    Base.appendMessage(llmMessage)
}

const handleUserMessage = async (message: DiscordMessage) => {
    const llmMessage = DisordMessageToLLMMessagePayload(message)
    Base.appendMessage(llmMessage)
    let response = await Base.send()
    if (!message.channel.isSendable()) return
    message.channel.sendTyping()
    if (response.choices[0].finish_reason === 'tool_calls') return handleToolCall(response)
    message.channel.send(response.choices[0].message.content)
    Base.emitter.emit(`${Base.name}::afterResponse`, createEmitterResponse({ response, agent: Base }))
}

const handleMessageCreate = async (message: DiscordMessage) => {
    if (message.author.bot) return handleSelfMessage(message)
    return handleUserMessage(message)
}

export { Base as PersonalityAgent }
