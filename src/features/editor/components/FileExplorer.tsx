import { useState, useMemo, useContext } from 'react';
import { FileCode, Folder, FolderOpen, ChevronRight, ChevronDown, CheckSquare, FolderSync } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParsedFile } from '../../../shared/types/api.types';
import SearchBar from './SearchBar';
import { defaultTransition } from '../../../animations/variants';
import ShortcutContext from '../../../shortcuts/shortcutContext';

interface FileExplorerProps {
  files: ParsedFile[];
  selectedFile: ParsedFile | null;
  onSelectFile: (file: ParsedFile) => void;
}

export default function FileExplorer({ files, selectedFile, onSelectFile }: FileExplorerProps) {
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const shortcutCtx = useContext(ShortcutContext);
  const pushContext = shortcutCtx?.pushContext || (() => {});
  const popContext = shortcutCtx?.popContext || (() => {});

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const active = document.activeElement as HTMLElement;
    if (!active || !active.classList.contains('tree-item')) return;

    const container = e.currentTarget;
    // Query DOM to find all visible tree items in their actual display order
    const items = Array.from(container.querySelectorAll<HTMLElement>('.tree-item'));
    const index = items.indexOf(active);

    const getParentPath = (path: string) => {
      const parts = path.split('/');
      parts.pop();
      return parts.join('/');
    };

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = Math.min(items.length - 1, index + 1);
        items[nextIndex].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = Math.max(0, index - 1);
        items[prevIndex].focus();
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        const isFolder = active.getAttribute('data-is-folder') === 'true';
        const path = active.getAttribute('data-path') || '';
        const isExpanded = expandedFolders[path] !== false;
        if (isFolder) {
          if (!isExpanded) {
            toggleFolder(path);
          } else {
            const nextIndex = index + 1;
            if (nextIndex < items.length) {
              items[nextIndex].focus();
            }
          }
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const isFolder = active.getAttribute('data-is-folder') === 'true';
        const path = active.getAttribute('data-path') || '';
        const isExpanded = expandedFolders[path] !== false;
        if (isFolder && isExpanded) {
          toggleFolder(path);
        } else {
          const parentPath = getParentPath(path);
          if (parentPath) {
            const parentEl = items.find(el => el.getAttribute('data-path') === parentPath);
            if (parentEl) {
              parentEl.focus();
            }
          }
        }
        break;
      }
      case 'Home': {
        e.preventDefault();
        if (items.length > 0) items[0].focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        if (items.length > 0) items[items.length - 1].focus();
        break;
      }
      default:
        break;
    }
  };

  const renderFolder = (
    folderName: string,
    folderData: any,
    currentPath: string = '',
    isFirstFolder: boolean = false
  ) => {
    const fullPath = currentPath ? `${currentPath}/${folderName}` : folderName;
    const isExpanded = expandedFolders[fullPath] !== false;

    const subfolderKeys = Object.keys(folderData.subfolders);
    const hasChildren = subfolderKeys.length > 0 || folderData.files.length > 0;

    return (
      <div key={fullPath} className="space-y-0.5 select-none font-mono">
        <button
          onClick={() => toggleFolder(fullPath)}
          className="tree-item w-full flex items-center gap-1.5 py-1 px-1 text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors text-left text-[11px] font-medium cursor-pointer"
          data-path={fullPath}
          data-is-folder="true"
          role="treeitem"
          aria-expanded={isExpanded}
          tabIndex={selectedFile ? -1 : (isFirstFolder ? 0 : -1)}
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
              role="group"
            >
              {subfolderKeys.map((subKey) =>
                renderFolder(subKey, folderData.subfolders[subKey], fullPath, false)
              )}
              {folderData.files.map((fileObj: any) => {
                const isSelected = selectedFile?.path === fileObj.file.path;
                return (
                  <button
                    key={fileObj.file.path}
                    onClick={() => onSelectFile(fileObj.file)}
                    className={`tree-item w-full flex items-center gap-2 py-1 px-2 rounded text-[11px] transition-colors relative cursor-pointer ${
                      isSelected
                        ? 'text-primary font-bold'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    data-path={fileObj.file.path}
                    data-is-folder="false"
                    role="treeitem"
                    aria-selected={isSelected}
                    tabIndex={isSelected ? 0 : -1}
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
            aria-label="Expand all folders"
          >
            <FolderSync className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleCollapseAll}
            className="p-1 hover:bg-white/5 text-gray-500 hover:text-white rounded transition-colors cursor-pointer"
            title="Collapse All"
            aria-label="Collapse all folders"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Filter files..." />

      <div 
        role="tree"
        aria-label="Workspace Files Explorer"
        onFocus={() => pushContext('explorer')}
        onBlur={() => popContext('explorer')}
        onKeyDown={handleKeyDown}
        className="flex-1 overflow-y-auto pr-1 scrollbar space-y-1"
      >
        {/* Files directly in root */}
        {tree.files.map((fileObj: any, i: number) => {
          const isSelected = selectedFile?.path === fileObj.file.path;
          const isFirst = i === 0;
          return (
            <button
              key={fileObj.file.path}
              onClick={() => onSelectFile(fileObj.file)}
              className={`tree-item w-full flex items-center gap-2 py-1 px-2 rounded text-[11px] font-mono transition-colors relative cursor-pointer ${
                isSelected
                  ? 'text-primary font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              data-path={fileObj.file.path}
              data-is-folder="false"
              role="treeitem"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : (selectedFile ? -1 : (isFirst ? 0 : -1))}
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
        {Object.keys(tree.subfolders).map((folderName, i) => {
          const isFirstFolder = tree.files.length === 0 && i === 0;
          return renderFolder(folderName, tree.subfolders[folderName], '', isFirstFolder);
        })}
      </div>
    </div>
  );
}
