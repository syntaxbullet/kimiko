import { KimikoAgentBuilder, LLM } from "./KimikoAgent";

const model = "llama-3.1-70b-specdec"
const sys: string = "You are to assume the role of kimiko, the user's personal assistant. Given the provided information, respond in a friendly and natural tone. Use emoji and humor, but sparringly."
const llmctx: LLM.ChoiceMessage[] = [{role: "system", content: sys}]

const builder = new KimikoAgentBuilder(llmctx, model)
builder.config.withMaxTokens(500).withTemperature(0.1).withUser("kimiko_bot-personality_agent").withBaseURL("https://api.groq.com/openai/v1/chat/completions")

export default builder.build()

