import * as vscode from "vscode";
import { TextDecoder } from "util";

import { Message, extractFilenames, Role } from "./conversation";

export const projectContext: Message[] = [];

export async function updateContext(): Promise<void> {
  const files = await getFiles();
  projectContext.length = 0;
  projectContext.push(
    ...files.map((content) => ({
      role: Role.user,
      content,
    } as Message))
  );
}

export function getRelevantContext(userInput: string): Message[] {
  const filenames = extractFilenames(userInput);

  const relevantContext = projectContext.filter((message) =>
    filenames.some((filename) => message.content.includes(filename))
  );
  return relevantContext.length > 0 ? relevantContext : projectContext;
}

async function getFiles(): Promise<string[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  if (workspaceFolder) {
    const files = await getFilesInDirectory(workspaceFolder.uri);
    const fileContentsPromise = await Promise.all(
      files.map(async (file) => {
        const content = await readFileContent(file);
        return `filename: ${file.path} \n ${content}`;
      })
    );
    return fileContentsPromise;
  }
  return [];
}

async function getFilesInDirectory(dir: vscode.Uri): Promise<vscode.Uri[]> {
  const entries = await vscode.workspace.fs.readDirectory(dir);
  const files: vscode.Uri[] = entries
    .filter(([name, type]) => type === vscode.FileType.File)
    .map(([name]) => vscode.Uri.joinPath(dir, name));
  const directories = entries.filter(
    ([name, type]) => type === vscode.FileType.Directory
  );

  for (const [name] of directories) {
    const subdir = vscode.Uri.joinPath(dir, name);
    const subdirFiles = await getFilesInDirectory(subdir);
    files.push(...subdirFiles);
  }

  return files;
}

async function readFileContent(file: vscode.Uri): Promise<string> {
  const fileUint8Array = await vscode.workspace.fs.readFile(file);
  return new TextDecoder().decode(fileUint8Array);
}
