import * as vscode from "vscode";

export function getFilePath(fileName: string): vscode.Uri {
  const folders = vscode.workspace.workspaceFolders;
  const path = folders ? folders[0].uri.path : undefined;
  return vscode.Uri.file(`${path}/${fileName}`);
}
