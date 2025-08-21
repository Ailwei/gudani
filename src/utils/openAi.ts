import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const client = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});
export async function getOpenAICompletion(
  promptOrMessages: string | ChatCompletionMessageParam[],
  apiKey?: string
) {
  try {
    const messages: ChatCompletionMessageParam[] =
      typeof promptOrMessages === "string"
        ? [{ role: "user", content: promptOrMessages }]
        : promptOrMessages;

    const response = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages,
    });

    return response;
  } catch (error: any) {
    throw error;
  }
}


