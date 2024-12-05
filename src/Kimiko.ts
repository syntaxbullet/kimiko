import { Kimiko } from '@kimiko'
import { Message, EmbedBuilder } from 'discord.js'
import getCurrentTimeAndDate from '@kimiko/tools/getCurrentTimeAndDate'
import appendToUserProfile from '@kimiko/tools/appendToUserProfile'
import getUserProfile from '@kimiko/tools/getUserProfile'
import updateUserProfileEntry from '@kimiko/tools/updateUserProfileEntry'

let systemPrompt = `Craft friendly and engaging messages as Kimiko, the user's personal assistant. 
Use the provided context to tailor each message to the user's situation, making them cute and inviting. 
Balance seriousness and humor based on the context and the user's preferences.

Present the message in short sentences, incorporating both cute and friendly language. 
Use emojis if appropriate to enhance the message's warmth and personality.
Avoid using them when the context is serious.

You will be working with muliple other agents who's messages you will be able to see but the user will not be able to see them.
those agents are going to provide you with contextual information that you will use to tailor your response to the user's situation.

Update the user's profile with information you wish to remember about the user, such as their name, age, or favorite color.
`

const config: Kimiko.Types.Groq_LLM.LLMRequestBody = {
    model: 'llama-3.1-70b-specdec',
    messages: [{ role: 'system', content: systemPrompt }],
    parallel_tool_calls: false,
    temperature: 0.3,
    max_tokens: 500,
}

const contextManager: Kimiko.IContextManager = new Kimiko.ContextManager()
const toolManager: Kimiko.IToolManager = new Kimiko.ToolManager()
const configManager: Kimiko.IConfigManager = new Kimiko.ConfigManager(
    config,
    contextManager,
    toolManager
)

toolManager.register(getCurrentTimeAndDate.def, getCurrentTimeAndDate.handle)
toolManager.register(getUserProfile.def, getUserProfile.handle)
toolManager.register(appendToUserProfile.def, appendToUserProfile.handle)
toolManager.register(updateUserProfileEntry.def, updateUserProfileEntry.handle)

const Agent = new Kimiko.Agent(
    configManager,
    contextManager,
    toolManager,
    Kimiko.Client
)

function createToolCallEmbed(toolName: string, toolCall?: Kimiko.Types.Groq_LLM.LLMToolMessagePayload): EmbedBuilder {
    let embedcolor = 0xff69b4 // pink
    let embedtitle = "Tool call successful!"
    if (toolCall?.content.startsWith('Tool call failed')) {
        embedcolor = 0xff0000 // red
        embedtitle = "Tool call failed!"
    }

    if (toolName === 'appendToUserProfile' || toolName === 'updateUserProfileEntry') {
        embedtitle = ":sparkles: User profile updated!"
    }

    return new EmbedBuilder()
        .setColor(embedcolor)
        .setTitle(embedtitle)
        .setDescription(`\`${toolName}\``)
        .addFields(
            { name: 'Status', value: toolCall ? toolCall.content.startsWith('Tool call failed') ? toolCall.content : "Tool call successful!" : "none" },
            { name: 'Tool Call ID', value: toolCall ? toolCall.tool_call_id : "none"}
        )
        .setTimestamp()
}

async function handleMessageCreate(message: Message) {
    let toolname = null;
    let toolCall: Kimiko.Types.Groq_LLM.LLMToolMessagePayload | null = null
    Agent.getContextManager().append(
        Kimiko.Utils.convertDiscordMessageToLLMMessage(message)
    )
    if (message.author.bot || !message.channel.isSendable()) return
    message.channel.sendTyping()
    let response: Kimiko.Types.Groq_LLM.LLMChatCompletionResponse =
        await Agent.send()
    if (response.choices[0].finish_reason == 'tool_calls' && response.choices[0].message.role == 'assistant') {
        toolname = response.choices[0].message.tool_calls![0].function.name
        response = await Agent.handleToolCalls(
            response.choices[0].message as Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload
        )
        toolCall = Agent.getContextManager().get()[Agent.getContextManager().get().length - 1] as Kimiko.Types.Groq_LLM.LLMToolMessagePayload
    }
    
    if (toolname) {
        await message.channel.send({ embeds: [createToolCallEmbed(toolname, toolCall!)] })
    }
    await message.channel.send(response.choices[0].message.content)
}

function registerEventHandlers() {
    Agent.events.on('messageCreate', handleMessageCreate)
}

export default {
    registerEventHandlers,
}
