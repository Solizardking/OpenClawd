import { type DirectoryInfo } from '@/src/utils/directory-detection';

/**
 * Handle invalid directory scenarios
 */
export function handleInvalidDirectory(directoryInfo: DirectoryInfo) {
  const messages: Record<string, (string | undefined)[]> = {
    'non-openclawd-dir': [
      "This directory doesn't appear to be an OpenClawd project.",
      directoryInfo.packageName && `Found package: ${directoryInfo.packageName}`,
      'OpenClawd update only works in OpenClawd projects, plugins, the OpenClawd monorepo, and OpenClawd infrastructure packages (e.g. client, cli).',
      'To create a new OpenClawd project, use: openclawd create <project-name>',
    ].filter(Boolean),
    invalid: [
      'Cannot update packages in this directory.',
      !directoryInfo.hasPackageJson
        ? "No package.json found. This doesn't appear to be a valid project directory."
        : 'The package.json file appears to be invalid or unreadable.',
      'To create a new OpenClawd project, use: openclawd create <project-name>',
    ].filter(Boolean),
  };

  const messageList = messages[directoryInfo.type];
  if (messageList) {
    messageList.forEach((msg) => console.info(msg));
  } else {
    console.error(`Unexpected directory type: ${directoryInfo.type}`);
  }
}
