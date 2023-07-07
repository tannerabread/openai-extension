import * as vscode from "vscode";

import { getFunction } from "../models/conversation";
import { FUNCTION_REGEX_PATTERN } from "./strings";

function getFunctionName(): string {
  return getFunction().match(FUNCTION_REGEX_PATTERN)![1];
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