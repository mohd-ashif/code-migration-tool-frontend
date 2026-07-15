import { DiffEditor } from '@monaco-editor/react';

interface MonacoDiffViewerProps {
  originalValue: string;
  modifiedValue: string;
  fileName: string;
  wordWrap: boolean;
  minimap: boolean;
  inlineDiff: boolean;
}

export default function MonacoDiffViewer({
  originalValue,
  modifiedValue,
  fileName,
  wordWrap,
  minimap,
  inlineDiff
}: MonacoDiffViewerProps) {
  const getLanguage = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="w-full h-full bg-[#090A11] select-text">
      <DiffEditor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={getLanguage(fileName)}
        original={originalValue}
        modified={modifiedValue}
        options={{
          readOnly: true,
          renderSideBySide: !inlineDiff,
          minimap: { enabled: minimap },
          wordWrap: wordWrap ? 'on' : 'off',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          folding: true,
          automaticLayout: true,
          renderLineHighlight: 'all',
          diffWordWrap: 'on'
        }}
      />
    </div>
  );
}
