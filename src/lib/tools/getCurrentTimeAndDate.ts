import { Kimiko } from "@kimiko/types";

/**
 * A tool that returns the current time and date in the format `YYYY-MM-DD HH:mm:ss`
 * 
 * @example
 * "What's the current time and date?"
 * "getCurrentTimeAndDate: 2023-09-11 10:23:45"
 */
export const definition: Kimiko.LLM.Tool = {
    function: {
        name: "getCurrentTimeAndDate",
        description: "Returns the current time and date in the format `YYYY-MM-DD HH:mm:ss`",
        parameters: {
            type: "object",
            properties: {}
        }
    },
    type: "function",
}

const handler = () => `getCurrentTimeAndDate: ${new Date().toISOString()}`;

export default { definition, handler };