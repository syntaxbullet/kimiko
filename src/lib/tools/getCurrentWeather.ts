import { Kimiko } from "@kimiko/types";
import { config as dotenvConfig } from "dotenv";

dotenvConfig()

/**
 * A tool that returns the current weather in the format `YYYY-MM-DD HH:mm:ss`
 * 
 * @example
 * "What's the current weather?"
 * "getCurrentWeather: The weather is cloudy with a temperature of 25 degrees."
 */
export const definition: Kimiko.LLM.Tool = {
    function: {
        name: "getCurrentWeather",
        description: "Returns the current weather information for a given location using the OpenWeatherMap API",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "The location to get the weather for"
                }
            },
            required: ["location"]
        }
    },
    type: "function",
}

async function getLatLong(location: string): Promise<{ lat: number, long: number }> {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${location}`)
    const data = await response.json()
    return { lat: data[0].lat, long: data[0].lon }
}

export const handler = async (ctx: any, args: string): Promise<string> => {
    if (!process.env.OPEN_WEATHER_MAP_API_KEY) {
        throw new Error("OPEN_WEATHER_MAP_API_KEY is not set");
    }
    const { location } = JSON.parse(args)
    const { lat, long } = await getLatLong(location)
    const response = await fetch(`https://api.openweathermap.org/data/3.0/weather?lat=${lat}&lon=${long}&appid=${process.env.OPEN_WEATHER_MAP_API_KEY}&units=metric`)
    const data = await response.json()
    console.log(data)
    return `getCurrentWeather: ${JSON.stringify(data.current)}`
}