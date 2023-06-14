import * as vscode from "vscode";

import { addMessage } from "./conversation";
import { updateWebviewContent, handleUserInputCommand } from "./webview";
import { createNewFile, readFile, writeFile, updateFile } from "./editor-util";

export let panel: vscode.WebviewPanel | undefined;
export const subscriptions: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "automation" is now active!');

  let disposable = vscode.commands.registerCommand(
    "automation.openWebview",
    () => {
      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          "automationWebview",
          "Automation Webview",
          vscode.ViewColumn.Two,
          {}
        );

        panel.onDidDispose(() => {
          panel = undefined;
        });
      }

      panel.webview.onDidReceiveMessage(async (message) => {
        if (message.command === "handleUserInput") {
          try {
            const apiResponse = await addMessage(message.userInput);
            panel?.webview.postMessage({
              command: "handleAssistantResponse",
              assistantResponse: apiResponse,
            });
          } catch (error) {
            console.error(error);
          }
        }
      });

      updateWebviewContent();
    }
  );

  subscriptions.push(disposable);

  subscriptions.push(
    vscode.commands.registerCommand(
      "automation.handleUserInput",
      handleUserInputCommand
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand("automation.createNewFile", createNewFile)
  );
  subscriptions.push(
    vscode.commands.registerCommand("automation.readFile", readFile)
  );
  subscriptions.push(
    vscode.commands.registerCommand("automation.writeFile", writeFile)
  );
  subscriptions.push(
    vscode.commands.registerCommand("automation.updateFile", updateFile)
  );

  context.subscriptions.push(...subscriptions);
}

export function deactivate() {
  for (const subscription of subscriptions) {
    subscription.dispose();
  }
  subscriptions.length = 0;
}
