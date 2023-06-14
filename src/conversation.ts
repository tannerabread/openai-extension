import * as openai from "openai";
import * as vscode from "vscode";
import { TextDecoder } from "util";

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

export const projectContext: Message[] = [];

export async function addMessage(userInput: string): Promise<string> {
  try {
    const requestPayload = {
      model: "gpt-3.5-turbo",
      // eslint-disable-next-line @typescript-eslint/naming-convention
      // max_tokens: 5000,
    };
    const userMessage: Message = { role: "user", content: userInput };

    // temp conversation to add in context on requests without flooding the webview/chat window
    await updateContext();
    const relevantContext = getRelevantContext();
    const tempConversation = [
      conversation[conversation.length - 1],
      ...relevantContext,
      userMessage,
    ];
    console.log(tempConversation);

    conversation.push(userMessage);
    updateWebviewContent();

    const completion = await openaiAPI.createChatCompletion({
      messages: tempConversation,
      ...requestPayload,
    });

    const usage = completion.data.usage;
    console.log({ usage });
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

function getRelevantContext(): Message[] {
  const mostRecentMessage = getMostRecentMessage();
  const filenames = extractFilenames(mostRecentMessage);

  const relevantContext = projectContext.filter((message) =>
    filenames.some((filename) => message.content.includes(filename))
  );

  if (relevantContext.length > 0) {
    return relevantContext;
  } else {
    return projectContext;
  }
}

function extractFilenames(message: string): string[] {
  const fileNameRegex = /[\w-]+\.(ts|js|tsx|jsx|css|json)/g;
  const matches = message.match(fileNameRegex);
  return matches ? matches : [];
}

function getMostRecentMessage(): string {
  const mostRecentMessage = conversation[conversation.length - 1];
  if (mostRecentMessage) {
    return mostRecentMessage.content;
  } else {
    throw new Error("No messages in conversation");
  }
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

async function getFiles(): Promise<string[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (workspaceFolder) {
    const files = await getFilesInDirectory(workspaceFolder.uri);
    const fileContentsPromise = await Promise.all(
      files.map(async (file) => {
        const content = await readFileContent(file);
        return `filename: ${file.path} \n ${content}`;
      })
    );
    return fileContentsPromise;
  }
  return [];
}

async function readFileContent(file: vscode.Uri): Promise<string> {
  const fileUint8Array = await vscode.workspace.fs.readFile(file);
  return new TextDecoder().decode(fileUint8Array);
}

async function getFilesInDirectory(dir: vscode.Uri): Promise<vscode.Uri[]> {
  const entries = await vscode.workspace.fs.readDirectory(dir);
  const files: vscode.Uri[] = entries
    .filter(([name, type]) => type === vscode.FileType.File)
    .map(([name]) => vscode.Uri.joinPath(dir, name));
  const directories = entries.filter(
    ([name, type]) => type === vscode.FileType.Directory
  );

  for (const [name] of directories) {
    const subdir = vscode.Uri.joinPath(dir, name);
    const subdirFiles = await getFilesInDirectory(subdir);
    files.push(...subdirFiles);
  }

  return files;
}

export async function updateContext(): Promise<void> {
  const files = await getFiles();
  console.log("update context", files);
  projectContext.length = 0;
  projectContext.push(
    ...files.map((content) => ({
      role: "user" as "system" | "user" | "assistant",
      content,
    }))
  );
}
