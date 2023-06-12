import * as vscode from "vscode";
import * as md from "markdown-it";

import { panel } from "./extension";
import { conversation, addMessage } from "./conversation";

const markdownParser = md();

export function updateWebviewContent() {
  if (panel) {
    panel.webview.html = getWebviewContent();
  }
}

export function getWebviewContent(): string {
  const messages = conversation
    .map(
      (message) =>
        `<div class="message ${message.role}">${markdownParser.render(
          message.content
        )}</div>`
    )
    .join("");

  const htmlcontent = `
    <html>
      <head>
        <style>
        .conversation {
          padding: 10px;
        }

        .message {
          margin-bottom: 10px;
        }
        
        .system {
          font-weight: bold;
        }
        
        .user {
          color: yellow;
        }
        
        .assistant {
          color: green;
        }
        </style>
      </head>
      <body>
        <div class="conversation">
          ${messages}
        </div>
      </body>
    </html>
  `;

  return htmlcontent;
}

export async function handleUserInputCommand() {
  const userInput = await vscode.window.showInputBox({
    prompt: "Enter your input",
  });
  if (userInput) {
    try {
      const apiResponse = await addMessage(userInput);
      console.log(apiResponse);
    } catch (error) {
      console.error(error);
    }
  }
}
