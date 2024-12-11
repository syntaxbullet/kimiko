import * as LLM_ChatCompletion from "./llm.types";
import * as KimikoTypes from "./kimiko.types";

export namespace Kimiko {
    // export all Groq LLM ChatCompletion endpoint types under Kimiko.Groq
    export import LLM = LLM_ChatCompletion

    // export all Kimiko types under Kimiko
    export import Core = KimikoTypes
}