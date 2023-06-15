import * as openai from "openai";

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openaiAPI = new openai.OpenAIApi(configuration);

export async function getAssistance(prompt: any): Promise<string> {
  const completion = await openaiAPI.createChatCompletion(prompt);
  const response = completion.data.choices[0].message?.content;
  if (response && typeof response === "string" && response.length > 0) {
    return response;
  } else {
    throw new Error("Unexpected or empty response from OpenAI API");
  }
}