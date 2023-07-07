import * as vscode from "vscode";

export function getFilePath(fileName: string): vscode.Uri {
  const folders = vscode.workspace.workspaceFolders;
  const rootPath = folders ? folders[0].uri.path : undefined;
  const fullPath = `${rootPath}/${fileName}`;
  return vscode.Uri.file(fullPath);
}
