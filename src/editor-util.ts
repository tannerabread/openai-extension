import * as vscode from "vscode";

import { getCodeBlock, getFunction } from "./conversation";

export async function createNewFile(): Promise<void> {
  const fileName: string | undefined = await vscode.window.showInputBox({
    prompt: "Enter the file name",
  });

  if (fileName) {
    const folders = vscode.workspace.workspaceFolders;
    const path = folders ? folders[0].uri.path : undefined;
    const uri = vscode.Uri.file(`${path}/${fileName}`);

    try {
      await vscode.workspace.fs.writeFile(uri, new Uint8Array());
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      console.error("Error creating new file:", error);
    }
  }
}

export async function readFile(): Promise<void> {
  const activeEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeEditor) {
    const text: string = activeEditor?.document?.getText();
    console.log(text);
  }
}

// export async function writeFile(content: string): Promise<void> {
export async function writeFile(): Promise<void> {
  const content: string = getCodeBlock();

  const activeEditor: vscode.TextEditor | undefined =
    vscode.window.activeTextEditor;
  if (activeEditor) {
    const document: vscode.TextDocument = activeEditor.document;
    const edit: vscode.WorkspaceEdit = new vscode.WorkspaceEdit();
    edit.replace(
      document.uri,
      new vscode.Range(0, 0, document.lineCount, 0),
      content
    );
    await vscode.workspace.applyEdit(edit);
  }
}

// export async function updateFile(content: string) {
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
    const functionName: string = content.match(
      /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/
    )![1];

    let edit = new vscode.WorkspaceEdit();

    for (let line = 0; line < document.lineCount; line++) {
      const lineText = document.lineAt(line);
      let regex = new RegExp("function\\s+" + functionName + "\\s*\\(", "g");

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
