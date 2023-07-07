import { getAssistance } from "../services/openai";
import { updateWebviewContent } from "../utils/webview";
import { getRelevantContext, updateContext } from "./context";
import { uIConstants } from "../constants/ui";

export enum Role {
  system = "system",
  user = "user",
  assistant = "assistant",
}

export type Message = {
  role: Role;
  content: string;
};

export const conversation: Message[] = [
  {
    role: Role.system,
    content: uIConstants.initialConversationMessage,
  },
];

export async function addMessage(userInput: string): Promise<string> {
  try {
    const prompt = await constructPrompt(userInput);

    conversation.push({ role: Role.user, content: userInput });
    updateWebviewContent();

    const response = await getAssistance(prompt);
    conversation.push({
      role: Role.assistant,
      content: response,
    });
    updateWebviewContent();

    return response;
  } catch (error) {
    console.error(uIConstants.errorAPI, error);
    throw error;
  }
}

async function constructTempConversation(
  userInput: string
): Promise<Message[]> {
  // const relevantContext: Message[] = getRelevantContext(userInput);
  const relevantContext: Message[] = getRelevantContext("");
  const tempConversation: Message[] = [
    conversation[conversation.length - 1],
    ...relevantContext,
    { role: Role.user, content: userInput },
  ];
  return tempConversation;
}

async function constructPrompt(
  userInput: string
): Promise<{ messages: Message[]; model: string }> {
  const requestPayload = {
    model: "gpt-3.5-turbo",
    // model: "gpt-4",
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
  const fileNameRegex = /[\w-/]+\.(tsx|jsx|ts|js|css|json)/g;
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
    throw new Error(uIConstants.errorCodeBlockNotFound);
  }
}

export function getFunction(): string {
  const mostRecentMessage = getMostRecentMessage();
  const functionRegex = /(function.*\(.*\).*\{(.|\n)*?\n\})/g;

  const match = mostRecentMessage.match(functionRegex);
  if (match) {
    return match[0];
  } else {
    throw new Error(uIConstants.errorFunctionNotFound);
  }
}

function getMostRecentMessage(): string {
  const mostRecentMessage = conversation[conversation.length - 1];
  if (mostRecentMessage) {
    return mostRecentMessage.content;
  } else {
    throw new Error(uIConstants.errorEmptyConversation);
  }
}
