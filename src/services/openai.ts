import * as openai from "openai";

import { OPENAI_API_KEY } from "../constants/api";
import { uIConstants } from "../constants/ui";

const configuration = new openai.Configuration({
  apiKey: OPENAI_API_KEY,
});

const openaiAPI = new openai.OpenAIApi(configuration);

export async function getAssistance(prompt: any): Promise<string> {
  const completion = await openaiAPI.createChatCompletion(prompt);
  const response = completion.data.choices[0].message?.content;
  if (response && typeof response === "string" && response.length > 0) {
    return response;
  } else {
    throw new Error(uIConstants.errorEmptyResponseFromApi);
  }
}
