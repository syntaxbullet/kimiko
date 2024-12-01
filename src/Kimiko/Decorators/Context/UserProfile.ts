import { BaseAgent } from '../../KimikoBaseAgent'
import { Kimiko } from '../../'
import { Message } from 'discord.js'

import fs from 'fs'
import path from 'path'


const editMergerPromptPath = path.join(process.cwd(), 'edit-merger.md')

const editMergerPrompt = fs.readFileSync(editMergerPromptPath, 'utf-8')

const editMergerAgent = new BaseAgent({
    model: 'llama-3.1-70b-specdec',
    max_tokens: 3000,
    temperature: 0.1,
    messages: [
        {
            role: 'system',
            content: editMergerPrompt,
        },
    ],
})
export class UserProfileDecorator implements Kimiko.Types.IKimikoAgent {
    private readonly _agent: Kimiko.Types.IKimikoAgent
    private readonly _tools: Kimiko.Types.Groq_LLM.LLMTool[] = [
        {
            function: {
                name: 'getProfile',
                description: 'Retrieves the userprofile as a markdown string.',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            },
            type: 'function',
        },
        {
            function: {
                name: 'setProfile',
                description:
                    'Append or update the userprofile as a markdown string.',
                parameters: {
                    type: 'object',
                    properties: {
                        profile: {
                            type: 'string',
                            description:
                                'The profile to set. Markdown is supported.',
                        },
                    },
                    required: ['profile'],
                },
            },
            type: 'function',
        },
    ]

    constructor(agent: Kimiko.Types.IKimikoAgent) {
        this._agent = agent

        this._agent.setConfig({
            ...this._agent.getConfig(),
            tools: this._tools,
        })

        this._agent.addMessage({
            role: 'assistant',
            content: this.getProfile(),
            name: 'userprofileinformation',
        })
    }

    addMessage(
        message: Kimiko.Types.Groq_LLM.LLMMessagePayload | Message
    ): void {
        this._agent.addMessage(message)
    }

    getMessages(): Kimiko.Types.Groq_LLM.LLMMessagePayload[] {
        return this._agent.getMessages()
    }

    setMessages(messages: Kimiko.Types.Groq_LLM.LLMMessagePayload[]): void {
        this._agent.setMessages(messages)
    }

    getConfig(): Kimiko.Types.Groq_LLM.LLMRequestBody {
        return this._agent.getConfig()
    }

    setConfig(config: Kimiko.Types.Groq_LLM.LLMRequestBody): void {
        this._agent.setConfig(config)
    }

    getBaseURL(): string {
        return this._agent.getBaseURL()
    }

    setBaseURL(url: string): void {
        this._agent.setBaseURL(url)
    }

    convertDiscordMessage(
        message: Message
    ): Kimiko.Types.Groq_LLM.LLMMessagePayload {
        return this._agent.convertDiscordMessage(message)
    }

    async send(
        tool_choice?: Kimiko.Types.Groq_LLM.LLMToolChoice
    ): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        this._agent.setConfig({
            ...this._agent.getConfig(),
            tool_choice: tool_choice,
        })
        const response = await this._agent.send()

        // restore the original tool choice
        this._agent.setConfig({
            ...this._agent.getConfig(),
            tool_choice: 'auto',
        })

        if (response.choices[0].finish_reason === 'tool_calls') {
            return this.handleFunctionCall(response)
        }

        return response
    }

    private ensureProfileExists() {
        const profilePath = path.join(process.cwd(), 'profile.md')

        if (!fs.existsSync(profilePath)) {
            fs.writeFileSync(profilePath, '')
        }
    }

    private getProfile(): string {
        this.ensureProfileExists()
        return fs.readFileSync(path.join(process.cwd(), 'profile.md'), 'utf-8')
    }

    private setProfile(profile: string) {
        this.ensureProfileExists()
        fs.writeFileSync(path.join(process.cwd(), 'profile.md'), profile)
    }

    private async handleFunctionCall(
        response: Kimiko.Types.Groq_LLM.LLMResponseBody
    ): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        const toolCallMessage = response.choices[0]
            .message as Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload
        const functionName = toolCallMessage.tool_calls![0].function.name
        const functionArgs = JSON.parse(
            toolCallMessage.tool_calls![0].function.arguments
        )

        if (functionName === 'getProfile') {
            this.handleGetProfile(toolCallMessage)
        }

        if (functionName === 'setProfile') {
            this.handleSetProfile(toolCallMessage, functionArgs)
        }

        return response
    }

    private async handleGetProfile(toolCallMessage: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        const result = this.getProfile()

        // generate a tool response message
        const toolResponseMessage: Kimiko.Types.Groq_LLM.LLMToolMessagePayload =
            {
                role: 'tool',
                content: result,
                tool_call_id: toolCallMessage.tool_calls![0].id,
            }
        this.addMessage(toolResponseMessage)

        return this.send('none')
    }

    private async handleSetProfile(toolCallMessage: Kimiko.Types.Groq_LLM.LLMAssistantMessagePayload, functionArgs: { profile: string }): Promise<Kimiko.Types.Groq_LLM.LLMResponseBody> {
        // add the profile to the conversation
        editMergerAgent.addMessage({
            role: 'assistant',
            content: this.getProfile(),
            name: 'userprofileinformation',
        })
        editMergerAgent.addMessage({
            role: 'user',
            content: functionArgs.profile,
        })

        const editMergerResponse = await editMergerAgent.send()
        const responsetext = editMergerResponse.choices[0].message.content
        
        this.setProfile(responsetext)
        editMergerAgent.setMessages([])
        // generate a tool response message
        const toolResponseMessage: Kimiko.Types.Groq_LLM.LLMToolMessagePayload =
            {
                role: 'tool',
                content: 'Profile updated.',
                tool_call_id: toolCallMessage.tool_calls![0].id,
            }
        this.addMessage(toolResponseMessage)

        return this.send('none')
    }
}
