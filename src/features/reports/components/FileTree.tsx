import React, { useState } from 'react';
import { FileCode, Folder, FolderOpen, Search, ChevronRight, ChevronDown } from 'lucide-react';
import { ParsedFile } from '../../../shared/types/api.types';

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
          className="w-full flex items-center gap-1.5 py-1 px-1.5 hover:bg-[#1E1F35]/40 rounded-lg text-xs font-medium text-gray-300 hover:text-white transition-colors text-left"
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
        {isExpanded && hasChildren && (
          <div className="pl-3.5 border-l border-[#1E1F35]/80 space-y-1.5 ml-2">
            {subfolderKeys.map((subKey) =>
              renderFolder(subKey, folderData.subfolders[subKey], fullPath)
            )}
            {folderData.files.map((fileObj: any) => {
              const isSelected = selectedFile?.path === fileObj.file.path;
              return (
                <button
                  key={fileObj.file.path}
                  onClick={() => onSelectFile(fileObj.file)}
                  className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs font-mono truncate transition-all ${
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                      : 'hover:bg-[#1E1F35]/40 text-gray-400 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{fileObj.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 select-none">
      {/* File Search */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter workspace files..."
          className="w-full pl-9 pr-3 py-2 bg-[#0B0B12] border border-[#1E1F35] text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs transition-all font-medium"
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
              className={`w-full flex items-center gap-2 py-1 px-2 rounded-lg text-xs font-mono truncate transition-all ${
                isSelected
                  ? 'bg-primary/10 text-primary border border-primary/20 font-bold'
                  : 'hover:bg-[#1E1F35]/40 text-gray-400 hover:text-gray-200 border border-transparent'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{fileObj.name}</span>
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
