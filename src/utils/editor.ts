import * as vscode from "vscode";

import { getCodeBlock, getFunction } from "../models/conversation";
import { FUNCTION_REGEX_PATTERN, functionDefinitionPattern } from "./strings";
import { getFilePath } from "./paths";
import { uIConstants } from "../constants/ui";

// needs util for printing file structures as "path/to/file" as well as multiline-to-single-line

export async function createAndOpenNewFile(): Promise<void> {
  const fileName = await vscode.window.showInputBox({
    prompt: uIConstants.promptNewFilename,
  });

  if (fileName) {
    const uri = getFilePath(fileName);
    try {
      await vscode.workspace.fs.writeFile(uri, new Uint8Array());
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      console.error(uIConstants.errorCreatingNewFile, error);
    }
  }
}

export async function readFile(): Promise<void> {
  const text = getActiveEditor()?.document?.getText();
  console.log(text);
}

export async function writeFile(): Promise<void> {
  const content = getCodeBlock();
  const editor = getActiveEditor();
  if (editor) {
    const document = editor.document;
    const edit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      content
    );
    await vscode.workspace.applyEdit(edit);
  }
}

export async function updateFile() {
  const activeTextEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  // const functionRegex = /(function.*\(.*\).*\{(.|\n)*?\n\})/g;

  try {
    const content: string = getFunction();

    if (!activeTextEditor) {
      return;
    }

    const { document } = activeTextEditor;
    const functionName: string = content.match(FUNCTION_REGEX_PATTERN)![1];

    let edit = new vscode.WorkspaceEdit();

    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      // let regex = new RegExp("function\\s+" + functionName + "\\s*\\(", "g");
      let regex = functionDefinitionPattern(functionName);

      if (lineText.text.match(regex)) {
        const start = new vscode.Position(line, 0);
        let endLine = line;
        let bracketCounter = 0;

        do {
          let lineText = document.lineAt(endLine).text;
          bracketCounter += (lineText.match(/{/g) || []).length;
          bracketCounter -= (lineText.match(/}/g) || []).length;
          endLine++;
        } while (bracketCounter > 0 && endLine < document.lineCount);

        const end = new vscode.Position(
          endLine,
          document.lineAt(endLine).text.length
        );

        edit.replace(
          document.uri,
          new vscode.Range(start, end),
          content + "\n"
        );
      }
    }

    await vscode.workspace.applyEdit(edit);

    if (activeTextEditor) {
      vscode.commands.executeCommand("editor.action.formatDocument");
    }
  } catch (error) {
    console.error(error);
  }
}
// export async function updateFile(): Promise<void> {
//   const editor = getActiveEditor();
//   if (!editor) {
//     return;
//   }
//   const functionName = getFunctionName();
//   const content = getFunction();
//   const edit = new vscode.WorkspaceEdit();
//   for (let line = 0; line < editor.document.lineCount; line++) {
//     const lineText = editor.document.lineAt(line);
//     const regex = new RegExp(`function\\s+${functionName}\\s*\\(`, "g");
//     if (lineText.text.match(regex)) {
//       const [start, end] = getFunctionBounds(line, editor.document);
//       edit.replace(
//         editor.document.uri,
//         new vscode.Range(start, end),
//         `${content}\n`
//       );
//     }
//   }
//   await vscode.workspace.applyEdit(edit);
//   vscode.commands.executeCommand("editor.action.formatDocument");
// }

function getActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}
