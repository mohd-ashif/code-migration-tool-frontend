import React, { useState } from 'react';
import { FileCode, Folder, FolderOpen, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParsedFile } from '../../../shared/types/api.types';
import { defaultTransition } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface FileTreeProps {
  files: ParsedFile[];
  selectedFile: ParsedFile | null;
  onSelectFile: (file: ParsedFile) => void;
}

const FileTree = React.memo(function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'src': true,
    'components': true,
  });
  const isReduced = useReducedMotion();

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderName]: !prev[folderName] }));
  };

  const filteredFiles = files.filter((f) =>
    f.path.toLowerCase().includes(search.toLowerCase())
  );

  // Group files into folder tree
  const buildTree = (fileList: ParsedFile[]) => {
    const root: any = { files: [], subfolders: {} };

    fileList.forEach((file) => {
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
  };

  const tree = buildTree(filteredFiles);

  const renderFolder = (folderName: string, folderData: any, currentPath: string = '') => {
    const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    const isExpanded = expandedFolders[fullPath] !== false; // expanded by default

    const subfolderKeys = Object.keys(folderData.subfolders);
    const hasChildren = subfolderKeys.length > 0 || folderData.files.length > 0;

    return (
      <div key={fullPath} className="space-y-1">
        {/* Folder row */}
        <button
          onClick={() => toggleFolder(fullPath)}
          className="w-full flex items-center gap-1.5 py-1 px-1.5 hover:bg-[#1E1F35]/40 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors text-left cursor-pointer"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-500" />
          )}
          {isExpanded ? (
            <FolderOpen className="w-3.5 h-3.5 shrink-0 text-[#A68CFF]" />
          ) : (
            <Folder className="w-3.5 h-3.5 shrink-0 text-[#A68CFF]" />
          )}
          <span className="truncate">{folderName}</span>
        </button>

        {/* Folder items */}
        <AnimatePresence initial={false}>
          {isExpanded && hasChildren && (
            <motion.div
              initial={isReduced ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={defaultTransition}
              className="pl-3.5 border-l border-border space-y-1.5 ml-2 overflow-hidden"
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
                    className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs font-mono truncate transition-colors relative cursor-pointer ${
                      isSelected
                        ? 'text-primary font-bold'
                        : 'hover:bg-[#1E1F35]/40 text-gray-400 hover:text-gray-200 border border-transparent'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="activeFileTreeSelection"
                        className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg pointer-events-none"
                        transition={defaultTransition}
                      />
                    )}
                    <FileCode className="w-3.5 h-3.5 shrink-0 relative z-10 text-current" />
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
    <div className="space-y-4 select-none">
      {/* File Search */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
        <motion.input
          type="text"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="Filter workspace files..."
          whileFocus={{ scale: 1.01, borderColor: "var(--primary)" }}
          transition={defaultTransition}
          className="w-full pl-9 pr-3 py-2 bg-[#0B0B12] border border-border text-white placeholder-gray-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-medium"
        />
      </div>

      {/* Folders Render */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar">
        {/* Render files directly in root */}
        {tree.files.map((fileObj: any) => {
          const isSelected = selectedFile?.path === fileObj.file.path;
          return (
            <button
              key={fileObj.file.path}
              onClick={() => onSelectFile(fileObj.file)}
              className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs font-mono truncate transition-colors relative cursor-pointer ${
                isSelected
                  ? 'text-primary font-bold'
                  : 'hover:bg-[#1E1F35]/40 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              {isSelected && (
                <motion.span
                  layoutId="activeFileTreeSelection"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg pointer-events-none"
                  transition={defaultTransition}
                />
              )}
              <FileCode className="w-3.5 h-3.5 shrink-0 relative z-10 text-current" />
              <span className="truncate relative z-10">{fileObj.name}</span>
            </button>
          );
        })}

        {/* Render folders in root */}
        {Object.keys(tree.subfolders).map((folderName) =>
          renderFolder(folderName, tree.subfolders[folderName])
        )}
      </div>
    </div>
  );
});

export default FileTree;
