import * as vscode from "vscode";
import * as md from "markdown-it";

import { panel } from "../extension";
import { conversation, addMessage } from "../models/conversation";
import { uIConstants } from "../constants/ui";

const markdownParser = md();

export function updateWebviewContent() {
  if (panel) {
    panel.webview.html = getWebviewContent();
    panel.webview.postMessage({ command: uIConstants.webviewLoaded });
  }
}

export function getWebviewContent(): string {
  const messages = conversation
    .map((message) => {
      let classes = ["message", message.role];
      const messageClass = classes.join(" ");
      return `<div class="${messageClass}">${markdownParser.render(
        message.content
      )}</div>`;
    })
    .join("");

  const htmlcontent = `
    <html>
      <head>
        <style>
          body {
            background-color: #121212;
            color: #d4d4d4;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 10px;
            margin: 10px;
          }

          .conversation {
            padding: 10px;
            overflow: auto;
            height: 100%;
          }

          .message {
            margin-top: 10px;
            margin-bottom: 10px;
            padding: 8px;
          }

          .message.user {
            background-color: #4797AE;
            color: white;
          }

          .message.assistant {
            background-color: #212121;
          }

          .message.system {
            background-color: #121212;
            font-weight: bold;
          }

          @keyframes dots {
            0%, 20% {
              color: rgba(255, 255, 255, 0);
              text-shadow: 0.25em 0 0 rgba(255, 255, 255, 0),
                0.5em 0 0 rgba(255, 255, 255, 0);
            }
            40% {
              color: #d4d4d4;
              text-shadow: 0.25em 0 0 #d4d4d4, 0.5em 0 0 rgba(255, 255, 255, 0);
            }
            60% {
              text-shadow: 0.25em 0 0 #d4d4d4, 0.5em 0 0 #d4d4d4;
            }
            80%, 100% {
              text-shadow: 0.25em 0 0 #d4d4d4, 0.5em 0 0 #d4d4d4,
                0.75em 0 0 #d4d4d4;
            }
          }

          button {
            background-color: #4797AE;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 8px 16px;
            cursor: pointer;
          }

          input[type="text"] {
            padding: 8px;
            border-radius: 25px;
            border: 1px solid #4797AE;
            background-color: #121212;
            color: #d4d4d4;
            width: 80%;
          }
        </style>
      </head>
      <body>
        <div class="conversation">
          ${messages}
        </div>
        <div>
          <input type="text" id="user-input" placeholder="Type here" />
          <button id="send-btn">Send</button>
        </div>
        <script>
          const vscode = acquireVsCodeApi();
          const sendBtn = document.getElementById("send-btn");
          const userInput = document.getElementById("user-input");
          sendBtn.addEventListener('click', () => {
            const inputString = userInput.value;
            vscode.postMessage({ command: "webviewInput", inputString });
          });
        </script>
      </body>
    </html>
  `;

  return htmlcontent;
}

export async function handleUserInput(inputString?: string) {
  const promptInput =
    inputString ??
    (await vscode.window.showInputBox({
      placeHolder: uIConstants.promptUserInput,
    })) ??
    "";

  if (promptInput) {
    try {
      const message = await addMessage(promptInput);
      console.log(message);
      updateWebviewContent();
    } catch (error) {
      console.error(error);
    }
  }
}
