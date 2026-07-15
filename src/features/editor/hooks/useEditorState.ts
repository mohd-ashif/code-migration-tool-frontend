import { useState } from 'react';
import { ParsedFile } from '../../../shared/types/api.types';

export type ViewMode = 'editor' | 'diff' | 'original';
export type DiffMode = 'side-by-side' | 'inline';
export type BottomTab = 'problems' | 'suggestions' | 'notes';

export function useEditorState() {
  const [selectedFile, setSelectedFile] = useState<ParsedFile | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('diff');
  const [diffMode, setDiffMode] = useState<DiffMode>('side-by-side');
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [minimap, setMinimap] = useState<boolean>(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('problems');
  
  // Resizable sizes (in pixels or percentages)
  const [sidebarWidth, setSidebarWidth] = useState<number>(240); // px
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(260); // px
  const [bottomPanelHeight, setBottomPanelHeight] = useState<number>(180); // px
  const [isRightPanelOpen, setIsRightPanelOpen] = useState<boolean>(true);
  const [isBottomPanelOpen, setIsBottomPanelOpen] = useState<boolean>(true);

  return {
    selectedFile,
    setSelectedFile,
    viewMode,
    setViewMode,
    diffMode,
    setDiffMode,
    wordWrap,
    setWordWrap,
    minimap,
    setMinimap,
    activeBottomTab,
    setActiveBottomTab,
    sidebarWidth,
    setSidebarWidth,
    rightPanelWidth,
    setRightPanelWidth,
    bottomPanelHeight,
    setBottomPanelHeight,
    isRightPanelOpen,
    setIsRightPanelOpen,
    isBottomPanelOpen,
    setIsBottomPanelOpen,
  };
}
