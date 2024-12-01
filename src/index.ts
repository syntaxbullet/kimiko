import { Events, Message } from 'discord.js'
import { KimikoClient } from './KimikoClient'
import { ResponderAgent } from './agents/ResponderAgent'
import MemoryAgent from './agents/MemoryAgent'
import fs from 'fs'
import path from 'path'
import { LLM } from './KimikoAgent'

const bot = new KimikoClient()

const FunctionResponderAgent = new ResponderAgent(false)
const ToolResponderAgent = new ResponderAgent(true)

