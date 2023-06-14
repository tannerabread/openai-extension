import * as vscode from "vscode";

import { getCodeBlock, getFunction } from "./conversation";

export async function createAndOpenNewTextDocument(): Promise<void> {
  const fileName = await vscode.window.showInputBox({
    prompt: "Enter the file name",
  });

  if (fileName) {
    const uri = getUri(fileName);
    try {
      await vscode.workspace.fs.writeFile(uri, new Uint8Array());
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.window.showTextDocument(doc);
    } catch (error) {
      console.error("Error creating new file:", error);
    }
  }
}

function getUri(fileName: string): vscode.Uri {
  const folders = vscode.workspace.workspaceFolders;
  const path = folders ? folders[0].uri.path : undefined;
  return vscode.Uri.file(`${path}/${fileName}`);
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

export async function updateFile(): Promise<void> {
  const editor = getActiveEditor();
  if (!editor) {
    return;
  }
  const functionName = getFunctionName();
  const content = getFunction();
  const edit = new vscode.WorkspaceEdit();
  for (let line = 0; line < editor.document.lineCount; line++) {
    const lineText = editor.document.lineAt(line);
    const regex = new RegExp(`function\\s+${functionName}\\s*\\(`, "g");
    if (lineText.text.match(regex)) {
      const [start, end] = getFunctionBounds(line, editor.document);
      edit.replace(
        editor.document.uri,
        new vscode.Range(start, end),
        `${content}\n`
      );
    }
  }
  await vscode.workspace.applyEdit(edit);
  vscode.commands.executeCommand("editor.action.formatDocument");
}

function getActiveEditor(): vscode.TextEditor | undefined {
  return vscode.window.activeTextEditor;
}

function getFunctionName(): string {
  return getFunction().match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/)![1];
}

function getFunctionBounds(
  line: number,
  document: vscode.TextDocument
): [vscode.Position, vscode.Position] {
  let startLine = line;
  while (
    startLine >= 0 &&
    !document.lineAt(startLine).text.startsWith("function")
  ) {
    startLine--;
  }
  const start = new vscode.Position(startLine, 0);
  let endLine = line;
  let bracketCounter = 0;
  do {
    const lineText = document.lineAt(endLine).text;
    bracketCounter += (lineText.match(/{/g) || []).length;
    bracketCounter -= (lineText.match(/}/g) || []).length;
    endLine++;
  } while (bracketCounter > 0 && endLine < document.lineCount);
  const end = new vscode.Position(
    endLine,
    document.lineAt(endLine).text.length
  );
  return [start, end];
}
