import Editor from '@monaco-editor/react';

interface MonacoEditorProps {
  value: string;
  fileName: string;
  wordWrap: boolean;
  minimap: boolean;
}

export default function MonacoEditor({ value, fileName, wordWrap, minimap }: MonacoEditorProps) {
  const getLanguage = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
        return 'typescript';
      case 'tsx':
        return 'typescript';
      case 'js':
        return 'javascript';
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
      case 'vue':
        return 'html'; // Monaco HTML fallback for Vue template highlight
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="w-full h-full bg-[#090A11] select-text">
      <Editor
        height="100%"
        width="100%"
        theme="vs-dark"
        language={getLanguage(fileName)}
        value={value}
        options={{
          readOnly: true,
          minimap: { enabled: minimap },
          wordWrap: wordWrap ? 'on' : 'off',
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          fontSize: 12,
          fontFamily: 'JetBrains Mono, monospace',
          folding: true,
          bracketPairColorization: { enabled: true },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          automaticLayout: true,
          renderLineHighlight: 'all',
          stickyScroll: { enabled: true }
        }}
      />
    </div>
  );
}
