import * as openai from "openai";

import { updateWebviewContent } from "./webview";

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openaiAPI = new openai.OpenAIApi(configuration);

export const conversation: Message[] = [
  {
    role: "system",
    content: "Hello, I am the assistant. How can I help you?",
  },
];

export async function addMessage(userInput: string): Promise<string> {
  try {
    const requestPayload = {
      model: "gpt-3.5-turbo",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      max_tokens: 500,
    };
    const userMessage: Message = { role: "user", content: userInput };
    conversation.push(userMessage);
    updateWebviewContent();

    const completion = await openaiAPI.createChatCompletion({
      messages: conversation,
      ...requestPayload,
    });

    const response = completion.data.choices[0].message?.content;
    if (response && typeof response === "string" && response.length > 0) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      conversation.push(assistantMessage);
      updateWebviewContent();
      return response;
    } else {
      throw new Error("Unexpected or empty response from OpenAI API");
    }
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}
