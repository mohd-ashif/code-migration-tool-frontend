import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import FileExplorer from './FileExplorer';
import EditorToolbar from './EditorToolbar';
import MonacoEditor from './MonacoEditor';
import MonacoDiffViewer from './MonacoDiffViewer';
import Breadcrumb from './Breadcrumb';
import DiagnosticsPanel from './DiagnosticsPanel';
import AIReviewPanel from './AIReviewPanel';
import { ParsedFile } from '../../../shared/types/api.types';
import { getMockOriginalContent } from '../utils/diff';

interface WorkspaceEditorProps {
  files: ParsedFile[];
  warnings?: string[];
  errors?: string[];
  healedIssues?: string[];
  manualReviews?: string[];
}

export default function WorkspaceEditor({
  files,
  warnings = [],
  errors = [],
  healedIssues = [],
  manualReviews = [],
}: WorkspaceEditorProps) {
  const state = useEditorState();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Set first file as selected initially if none is selected
  useEffect(() => {
    if (files.length > 0 && !state.selectedFile) {
      state.setSelectedFile(files[0]);
    }
  }, [files, state.selectedFile]);

  // Handle ESC key to exit fullscreen, and prevent body scroll when open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Compute original file content mock
  const originalCode = useMemo(() => {
    if (!state.selectedFile) return '';
    return getMockOriginalContent(state.selectedFile.path, state.selectedFile.content);
  }, [state.selectedFile]);

  const activeCode = state.selectedFile?.content || '';
  const currentFileName = state.selectedFile?.path || '';

  // Resizing mouse handles
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = state.sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      state.setSidebarWidth(Math.max(160, Math.min(400, startWidth + deltaX)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleRightPanelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = state.rightPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX; // drag left to expand
      state.setRightPanelWidth(Math.max(180, Math.min(380, startWidth + deltaX)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleBottomPanelMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = state.bottomPanelHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY; // drag up to expand
      state.setBottomPanelHeight(Math.max(100, Math.min(320, startHeight + deltaY)));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDownload = () => {
    if (!state.selectedFile) return;
    const downloadCode = state.viewMode === 'original' ? originalCode : activeCode;
    const element = document.createElement("a");
    const file = new Blob([downloadCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = currentFileName.split('/').pop() || 'file';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div
      ref={workspaceRef}
      className={`border border-border bg-[#0E0F1A] overflow-hidden flex select-none relative shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[999] h-screen w-screen rounded-none'
          : 'rounded-2xl h-[580px]'
      }`}
    >
      {/* 1. Left Sidebar - File Explorer */}
      <div
        style={{ width: `${state.sidebarWidth}px` }}
        className="h-full border-r border-border p-4 bg-[#10101B] shrink-0 flex flex-col overflow-hidden"
      >
        <FileExplorer
          files={files}
          selectedFile={state.selectedFile}
          onSelectFile={state.setSelectedFile}
        />
      </div>

      {/* Resize handle: Sidebar <-> Editor */}
      <div
        onMouseDown={handleSidebarMouseDown}
        className="w-1.5 h-full cursor-col-resize hover:bg-primary/40 bg-transparent transition-colors z-20 shrink-0 select-none"
      />

      {/* Center & Right panels */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        
        {/* 2. Middle Panel - Toolbar, Editor, Footer problems */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Top toolbar */}
          <EditorToolbar
            fileName={currentFileName}
            viewMode={state.viewMode}
            onViewModeChange={state.setViewMode}
            diffMode={state.diffMode}
            onDiffModeChange={state.setDiffMode}
            wordWrap={state.wordWrap}
            onWordWrapToggle={() => state.setWordWrap(!state.wordWrap)}
            minimap={state.minimap}
            onMinimapToggle={() => state.setMinimap(!state.minimap)}
            fullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
            code={state.viewMode === 'original' ? originalCode : activeCode}
            onDownload={handleDownload}
          />

          {/* Active file breadcrumb path */}
          <Breadcrumb filePath={currentFileName} />

          {/* Editors container */}
          <div className="flex-1 min-h-0 relative">
            {state.selectedFile ? (
              <>
                {state.viewMode === 'original' && (
                  <MonacoEditor
                    value={originalCode}
                    fileName={currentFileName}
                    wordWrap={state.wordWrap}
                    minimap={state.minimap}
                  />
                )}
                {state.viewMode === 'editor' && (
                  <MonacoEditor
                    value={activeCode}
                    fileName={currentFileName}
                    wordWrap={state.wordWrap}
                    minimap={state.minimap}
                  />
                )}
                {state.viewMode === 'diff' && (
                  <MonacoDiffViewer
                    originalValue={originalCode}
                    modifiedValue={activeCode}
                    fileName={currentFileName}
                    wordWrap={state.wordWrap}
                    minimap={state.minimap}
                    inlineDiff={state.diffMode === 'inline'}
                  />
                )}
              </>
            ) : (
              <div className="w-full h-full bg-[#090A11] flex items-center justify-center text-xs text-gray-500 font-mono select-none">
                Select a file from the explorer list.
              </div>
            )}
          </div>

          {/* Bottom Panel - Diagnostics Problems */}
          {state.isBottomPanelOpen && (
            <div style={{ height: `${state.bottomPanelHeight}px` }} className="shrink-0 flex flex-col overflow-hidden relative">
              {/* Resize Handle: Editor <-> Diagnostics */}
              <div
                onMouseDown={handleBottomPanelMouseDown}
                className="h-1.5 w-full cursor-row-resize hover:bg-primary/40 bg-transparent transition-colors z-20 absolute top-0 left-0 right-0 select-none"
              />
              <div className="flex-1 min-h-0 pt-1.5">
                <DiagnosticsPanel
                  warnings={warnings}
                  errors={errors}
                  suggestions={manualReviews}
                  healedNotes={healedIssues}
                  activeTab={state.activeBottomTab}
                  onTabChange={state.setActiveBottomTab}
                  onClose={() => state.setIsBottomPanelOpen(false)}
                />
              </div>
            </div>
          )}

          {/* Toggle diagnostics pane open trigger if closed */}
          {!state.isBottomPanelOpen && (
            <div className="bg-[#12131F] border-t border-border px-4 py-1.5 flex justify-between shrink-0 font-mono text-[9px] text-gray-500 select-none">
              <span>Diagnostics console hidden</span>
              <button
                onClick={() => state.setIsBottomPanelOpen(true)}
                className="text-primary hover:underline cursor-pointer font-bold"
              >
                Show Console
              </button>
            </div>
          )}
        </div>

        {/* Resize Handle: Editor <-> AI Summary */}
        {state.isRightPanelOpen && (
          <div
            onMouseDown={handleRightPanelMouseDown}
            className="w-1.5 h-full cursor-col-resize hover:bg-primary/40 bg-transparent transition-colors z-20 shrink-0 select-none"
          />
        )}

        {/* 3. Right Sidebar - AI review summary */}
        {state.isRightPanelOpen && (
          <div
            style={{ width: `${state.rightPanelWidth}px` }}
            className="h-full shrink-0 flex flex-col overflow-hidden bg-[#10101B]"
          >
            <AIReviewPanel
              confidenceScore={warnings.length > 0 ? 88 : 96}
              healedCount={healedIssues.length}
              warningsCount={warnings.length}
              manualCount={manualReviews.length}
              onClose={() => state.setIsRightPanelOpen(false)}
            />
          </div>
        )}

        {/* Toggle right pane open trigger if closed */}
        {!state.isRightPanelOpen && (
          <button
            onClick={() => state.setIsRightPanelOpen(true)}
            className="w-8 h-full bg-[#10101B] border-l border-border hover:bg-white/5 flex items-center justify-center text-[10px] text-gray-500 font-bold font-mono tracking-widest uppercase cursor-pointer [writing-mode:vertical-lr]"
          >
            Open Summary
          </button>
        )}
      </div>
    </div>
  );
}
