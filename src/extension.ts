import * as vscode from "vscode";

import { addMessage } from "./models/conversation";
import { updateWebviewContent, handleUserInput } from "./utils/webview";
import {
  createAndOpenNewFile,
  readFile,
  writeFile,
  updateFile,
} from "./utils/editor";
import { commandConstants } from "./constants/commands";
import { uIConstants } from "./constants/ui";

export let panel: vscode.WebviewPanel | undefined;
export const subscriptions: vscode.Disposable[] = [];

export function activate(context: vscode.ExtensionContext) {
  console.log(uIConstants.extensionActivated);

  let disposable = vscode.commands.registerCommand(
    commandConstants.openWebViewCommand,
    () => {
      if (!panel) {
        panel = vscode.window.createWebviewPanel(
          commandConstants.webviewName,
          commandConstants.webviewTitle,
          vscode.ViewColumn.Two,
          {
            enableScripts: true,
          }
        );

        panel.onDidDispose(() => {
          panel = undefined;
        });
      }

      panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.command) {
          case commandConstants.webViewInput:
            try {
              const apiResponse = await addMessage(message.inputString);
              break;
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
      commandConstants.handleUserInputCommand,
      handleUserInput
    )
  );

  subscriptions.push(
    vscode.commands.registerCommand(
      commandConstants.createNewFileCommand,
      createAndOpenNewFile
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(commandConstants.readFileCommand, readFile)
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      commandConstants.writeFileCommand,
      writeFile
    )
  );
  subscriptions.push(
    vscode.commands.registerCommand(
      commandConstants.updateFileCommand,
      updateFile
    )
  );

  context.subscriptions.push(...subscriptions);
}

export function deactivate() {
  for (const subscription of subscriptions) {
    subscription.dispose();
  }
  subscriptions.length = 0;
}
