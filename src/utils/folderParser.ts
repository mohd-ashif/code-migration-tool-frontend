export interface ParsedFileItem {
  path: string;
  content: string;
}

/**
 * Recursively parses dropped directory items using HTML5 FileSystem API (webkitGetAsEntry)
 */
export async function parseDroppedItems(items: DataTransferItemList): Promise<ParsedFileItem[]> {
  const resultFiles: ParsedFileItem[] = [];

  const entryPromises: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === 'file') {
      const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
      if (entry) {
        entryPromises.push(traverseEntry(entry, '', resultFiles));
      } else {
        const file = item.getAsFile();
        if (file) {
          entryPromises.push(
            readFileAsText(file).then((content) => {
              resultFiles.push({ path: file.name, content });
            })
          );
        }
      }
    }
  }

  await Promise.all(entryPromises);
  return resultFiles.filter(f => !shouldIgnoreFile(f.path));
}

async function traverseEntry(entry: FileSystemEntry, currentPath: string, fileList: ParsedFileItem[]): Promise<void> {
  const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

  if (shouldIgnoreFile(relativePath)) {
    return;
  }

  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry;
    await new Promise<void>((resolve) => {
      fileEntry.file(async (file) => {
        try {
          const content = await readFileAsText(file);
          fileList.push({ path: relativePath, content });
        } catch {
          // Ignore binary/read errors for unsupported files
        }
        resolve();
      });
    });
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry;
    const dirReader = dirEntry.createReader();
    
    const entries = await readAllDirectoryEntries(dirReader);
    const subPromises = entries.map((childEntry) => traverseEntry(childEntry, relativePath, fileList));
    await Promise.all(subPromises);
  }
}

function readAllDirectoryEntries(dirReader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  return new Promise((resolve) => {
    const entries: FileSystemEntry[] = [];
    const readBatch = () => {
      dirReader.readEntries((batch) => {
        if (batch.length === 0) {
          resolve(entries);
        } else {
          entries.push(...batch);
          readBatch();
        }
      });
    };
    readBatch();
  });
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function shouldIgnoreFile(filePath: string): boolean {
  const ignoredPatterns = [
    'node_modules/',
    '.git/',
    '.next/',
    'dist/',
    'build/',
    '.DS_Store',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];
  return ignoredPatterns.some((pattern) => filePath.includes(pattern));
}
