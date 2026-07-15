import { useState, useMemo } from 'react';
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, CheckSquare, FolderSync } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParsedFile } from '../../../shared/types/api.types';
import SearchBar from './SearchBar';
import { defaultTransition } from '../../../animations/variants';

interface FileExplorerProps {
  files: ParsedFile[];
  selectedFile: ParsedFile | null;
  onSelectFile: (file: ParsedFile) => void;
}

export default function FileExplorer({ files, selectedFile, onSelectFile }: FileExplorerProps) {
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const filteredFiles = useMemo(() => {
    return files.filter((f) => f.path.toLowerCase().includes(search.toLowerCase()));
  }, [files, search]);

  // Group files into folder tree
  const tree = useMemo(() => {
    const root: any = { files: [], subfolders: {} };
    filteredFiles.forEach((file) => {
      const parts = file.path.split('/');
      let current = root;

      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i];
        if (!current.subfolders[folder]) {
          current.subfolders[folder] = { files: [], subfolders: {} };
        }
        current = current.subfolders[folder];
      }

      const fileName = parts[parts.length - 1];
      current.files.push({ name: fileName, file });
    });
    return root;
  }, [filteredFiles]);

  const toggleFolder = (fullPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [fullPath]: prev[fullPath] === false ? true : false,
    }));
  };

  const handleExpandAll = () => {
    const next: Record<string, boolean> = {};
    files.forEach((f) => {
      const parts = f.path.split('/');
      let path = '';
      for (let i = 0; i < parts.length - 1; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i];
        next[path] = true;
      }
    });
    setExpandedFolders(next);
  };

  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    files.forEach((f) => {
      const parts = f.path.split('/');
      let path = '';
      for (let i = 0; i < parts.length - 1; i++) {
        path = path ? `${path}/${parts[i]}` : parts[i];
        next[path] = false;
      }
    });
    setExpandedFolders(next);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode className="w-3.5 h-3.5 text-[#3178C6] shrink-0" />;
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-[#F7DF1E] shrink-0" />;
      case 'vue':
        return <FileCode className="w-3.5 h-3.5 text-[#4FC08D] shrink-0" />;
      case 'html':
        return <FileCode className="w-3.5 h-3.5 text-[#E34F26] shrink-0" />;
      case 'css':
      case 'scss':
        return <FileCode className="w-3.5 h-3.5 text-[#1572B6] shrink-0" />;
      case 'json':
        return <FileCode className="w-3.5 h-3.5 text-[#CBCB41] shrink-0" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
    }
  };

  const renderFolder = (folderName: string, folderData: any, currentPath: string = '') => {
    const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    const isExpanded = expandedFolders[fullPath] !== false; // expanded by default

    const subfolderKeys = Object.keys(folderData.subfolders);
    const hasChildren = subfolderKeys.length > 0 || folderData.files.length > 0;

    return (
      <div key={fullPath} className="space-y-0.5 select-none font-mono">
        <button
          onClick={() => toggleFolder(fullPath)}
          className="w-full flex items-center gap-1.5 py-1 px-1 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors text-left text-[11px] font-medium cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-500 shrink-0" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 text-[#A68CFF] shrink-0" />
          ) : (
            <Folder className="w-3.5 h-3.5 text-[#7C6CFF] shrink-0" />
          )}
          <span className="truncate">{folderName}</span>
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={defaultTransition}
              className="pl-3 border-l border-border/60 ml-2.5 space-y-0.5 overflow-hidden"
            >
              {subfolderKeys.map((subKey) =>
                renderFolder(subKey, folderData.subfolders[subKey], fullPath)
              )}
              {folderData.files.map((fileObj: any) => {
                const isSelected = selectedFile?.path === fileObj.file.path;
                return (
                  <button
                    key={fileObj.file.path}
                    onClick={() => onSelectFile(fileObj.file)}
                    className={`w-full flex items-center gap-2 py-1 px-2 rounded text-[11px] transition-colors relative cursor-pointer ${
                      isSelected
                        ? 'text-primary font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="explorerActiveSelection"
                        className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-r pointer-events-none"
                        transition={defaultTransition}
                      />
                    )}
                    {getFileIcon(fileObj.name)}
                    <span className="truncate relative z-10">{fileObj.name}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full space-y-3.5">
      <div className="flex justify-between items-center select-none shrink-0">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
          Workspace Files
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExpandAll}
            className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded transition-colors cursor-pointer"
            title="Expand All"
          >
            <FolderSync className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCollapseAll}
            className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded transition-colors cursor-pointer"
            title="Collapse All"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Filter files..." />

      <div className="flex-1 overflow-y-auto pr-1 scrollbar space-y-1">
        {/* Files directly in root */}
        {tree.files.map((fileObj: any) => {
          const isSelected = selectedFile?.path === fileObj.file.path;
          return (
            <button
              key={fileObj.file.path}
              onClick={() => onSelectFile(fileObj.file)}
              className={`w-full flex items-center gap-2 py-1 px-2 rounded text-[11px] font-mono transition-colors relative cursor-pointer ${
                isSelected
                  ? 'text-primary font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="explorerActiveSelection"
                  className="absolute inset-0 bg-primary/10 border-l-2 border-primary rounded-r pointer-events-none"
                  transition={defaultTransition}
                />
              )}
              {getFileIcon(fileObj.name)}
              <span className="truncate relative z-10">{fileObj.name}</span>
            </button>
          );
        })}

        {/* Folders in root */}
        {Object.keys(tree.subfolders).map((folderName) =>
          renderFolder(folderName, tree.subfolders[folderName])
        )}
      </div>
    </div>
  );
}
