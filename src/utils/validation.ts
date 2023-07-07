import { VALID_FILENAME_REGEX, SUPPORTED_FILETYPES } from "./strings";

export function validateUserInput(input: string): boolean {
  // only allow letters, numbers, hyphens, underscores, and periods
  return VALID_FILENAME_REGEX.test(input);
}

export function validFileType(fileType: string): boolean {
  return SUPPORTED_FILETYPES.includes(fileType);
}
