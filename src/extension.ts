import * as vscode from "vscode";
import * as openai from "openai";

const configuration = new openai.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openaiAPI = new openai.OpenAIApi(configuration);

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

let conversation: Message[] = [];

async function callOpenAIAPI(userInput: string): Promise<string> {
  try {
    const requestPayload = {
      max_tokens: 50,
    };
    const userMessage: Message = { role: "user", content: userInput };
    addMessageToConversation(userMessage);

    console.log({ conversation });

    const completion = await openaiAPI.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: conversation,
      ...requestPayload,
    });

    // Extract and return the generated message from the API response
    const response = completion.data.choices[0].message?.content;
    if (response && typeof response === "string" && response.length > 0) {
      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      };
      addMessageToConversation(assistantMessage);
      return response;
    } else {
      throw new Error("Unexpected or empty response from OpenAI API");
    }
  } catch (error) {
    console.error("Error in OpenAI API call:", error);
    throw error;
  }
}

function addMessageToConversation(message: Message) {
  conversation.push(message);
}

async function handleUserInputCommand() {
  const userInput = await vscode.window.showInputBox({
    prompt: "Enter your input",
  });
  if (userInput) {
    try {
      const apiResponse = await callOpenAIAPI(userInput);
      console.log(apiResponse);
    } catch (error) {
      console.error(error);
    }
  }
}

let subscriptions: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "automation" is now active!');

  let disposable = vscode.commands.registerCommand(
    "automation.openWebview",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "automationWebview",
        "Automation Webview",
        vscode.ViewColumn.One,
        {}
      );

      panel.webview.html = "<h1>Hello Webview</h1>";
    }
  );

  subscriptions.push(disposable);

  subscriptions.push(
    vscode.commands.registerCommand(
      "automation.handleUserInput",
      handleUserInputCommand
    )
  );

  context.subscriptions.push(...subscriptions);
}

export function deactivate() {
  for (const subscription of subscriptions) {
    subscription.dispose();
  }
  subscriptions = [];
}
