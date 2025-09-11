import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});
export async function getOpenAICompletion(
  promptOrMessages: string | ChatCompletionMessageParam[],
) {
  try {
    const messages: ChatCompletionMessageParam[] =
      typeof promptOrMessages === "string"
        ? [{ role: "user", content: promptOrMessages }]
        : promptOrMessages;

    const response = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages,
    });

    return response;
  } catch (error: unknown) {
    throw error;
  }
}


