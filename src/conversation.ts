import { getAssistance } from "./openai";
import { updateWebviewContent } from "./webview";
import { getRelevantContext, updateContext } from "./context";

export const SYSTEM_ROLE = "system";
export const USER_ROLE = "user";
export const ASSISTANT_ROLE = "assistant";

export type Message = {
  role: typeof SYSTEM_ROLE | typeof USER_ROLE | typeof ASSISTANT_ROLE;
  content: string;
};

export const conversation: Message[] = [
  {
    role: SYSTEM_ROLE,
    content: "Hello, I am the assistant. How can I help you?",
  },
];

export async function addMessage(userInput: string): Promise<string> {
  try {
    const prompt = await constructPrompt(userInput);

    conversation.push({ role: USER_ROLE, content: userInput });
    updateWebviewContent();

    const response = await getAssistance(prompt);
    conversation.push({
      role: ASSISTANT_ROLE,
      content: response,
    });
    updateWebviewContent();

    return response;
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}

async function constructTempConversation(
  userInput: string
): Promise<Message[]> {
  const relevantContext: Message[] = getRelevantContext(userInput);
  const tempConversation: Message[] = [
    conversation[conversation.length - 1],
    ...relevantContext,
    { role: USER_ROLE, content: userInput },
  ];
  return tempConversation;
}

async function constructPrompt(userInput: string): Promise<{ messages: Message[], model: string }> {
  const requestPayload = {
    model: "gpt-3.5-turbo",
  };

  await updateContext();
  const tempConversation = await constructTempConversation(userInput);
  console.log(tempConversation);
  return {
    messages: tempConversation,
    ...requestPayload,
  };
}

export function extractFilenames(message: string): string[] {
  const fileNameRegex = /[\w-]+\.(ts|js|tsx|jsx|css|json)/g;
  const matches = message.match(fileNameRegex);
  return matches ? matches : [];
}

export function getCodeBlock(): string {
  const mostRecentMessage = getMostRecentMessage();
  const codeBlockRegex = /```([^`]+)```/s;

  const match = mostRecentMessage.match(codeBlockRegex);
  if (match) {
    return match[1].trim();
  } else {
    throw new Error("No code block found");
  }
}

export function getFunction(): string {
  const mostRecentMessage = getMostRecentMessage();
  const functionRegex = /(function.*\(.*\).*\{(.|\n)*?\n\})/g;

  const match = mostRecentMessage.match(functionRegex);
  if (match) {
    return match[0];
  } else {
    throw new Error("No function name found");
  }
}

function getMostRecentMessage(): string {
  const mostRecentMessage = conversation[conversation.length - 1];
  if (mostRecentMessage) {
    return mostRecentMessage.content;
  } else {
    throw new Error("No messages in conversation");
  }
}
