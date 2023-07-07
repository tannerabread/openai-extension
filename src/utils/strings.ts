export const FUNCTION_REGEX_PATTERN =
  /function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/;

export function functionDefinitionPattern(functionName: string): RegExp {
  return new RegExp("function\\s+" + functionName + "\\s*\\(", "g");
}

export const VALID_FILENAME_REGEX = /^([\w,\s-]+\/)*[\w,\s-]+\.[A-Za-z]+$/;
export const SUPPORTED_FILETYPES = [
  "js",
  "ts",
  "jsx",
  "tsx",
  "css",
  "html",
  "json",
  "md",
];
