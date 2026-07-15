/**
 * Generates realistic original source code from migrated code for visual diff comparison.
 */
export function getMockOriginalContent(filePath: string, migratedContent: string): string {
  if (!migratedContent) return '';

  let original = migratedContent;

  // 1. Revert Next.js link imports back to standard react-router links
  if (original.includes("import Link from 'next/link'")) {
    original = original.replace(
      "import Link from 'next/link'",
      "import { Link } from 'react-router-dom'"
    );
  }

  // 2. Revert Next.js Router back to react-router-dom hooks
  if (original.includes("import { useRouter } from 'next/router'") || original.includes("import { useRouter } from 'next/navigation'")) {
    original = original.replace(
      /import \{ useRouter \} from 'next\/(router|navigation)';?/,
      "import { useHistory } from 'react-router-dom';"
    );
    original = original.replace(/const router = useRouter\(\);?/g, "const history = useHistory();");
    original = original.replace(/router\.push\(/g, "history.push(");
  }

  // 3. Revert TypeScript annotations to any to show typing healing
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    original = original.replace(
      /const ([a-zA-Z0-9_]+): (string|number|boolean|any\[\]|Record<[^>]+>)/g,
      "let $1"
    );
    original = original.replace(/as const;?/g, ";");
  }

  // 4. Reintroduce some mock unused imports or dead variables that the compiler cleaned up
  const lines = original.split('\n');
  const insertIndex = Math.min(3, lines.length);
  
  const mockDeadCode = [
    "// TODO: Refactor legacy imports below",
    "const unusedSecretToken = 'temp_api_key_12345';",
    "let oldRef = null;"
  ];

  lines.splice(insertIndex, 0, ...mockDeadCode);

  return lines.join('\n');
}
