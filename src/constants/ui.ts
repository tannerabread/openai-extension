export const uIConstants = {
  extensionActivated: "Congratulations, your extension is now active!",
  webviewLoaded: "webviewLoaded",

  promptUserInput: "How can I help you?",
  promptNewFile:
    "Please enter the full filename, including type and directory. If no directory path or file type is provided, the default will be used.",
  promptOverwriteFile: "File already exists. Overwrite?",

  errorAPI: "Error in OpenAI API call: ",
  errorEmptyResponseFromApi:
    "Error: Unexpected or Empty response from OpenAI API",
  errorNoAPIKey: "No OpenAI API key found",

  errorCreatingNewFile: "Error creating new file: ",
  errorInvalidFileName:
    "Error: Invalid file name. Filename should be in the format: directory/filename.type",
  errorUnsupportedFileType: "Error: Unsupported file type",

  errorReadingFile: "Error reading file: ",
  
  errorWritingFile: "Error writing file: ",
  errorWritePermission: "Error: Write permission denied",
  
  errorUpdatingFile: "Error updating file: ",

  errorCodeBlockNotFound: "Error: Code block not found",
  errorFunctionNotFound: "Error: Function not found",
  errorEmptyConversation: "Error: No messages in conversation",

  initialConversationMessage: "Hello, I am the assistant. How can I help you?",
};
