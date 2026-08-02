import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Card from '../../../shared/components/Card';
import Button from '../../../components/common/Button';
import { Play, Pause, RotateCcw, XCircle, Terminal, Wifi, WifiOff, Loader2, PlusCircle, CheckCircle2 } from 'lucide-react';
import { useWebSocket } from '../../../hooks/useWebSocket';
import apiClient from '../../../services/http/apiClient';

import { toast } from '../../../services/toast/toast.service';
import ConfirmModal from '../../../components/common/ConfirmModal';

interface LiveMigrationTrackerProps {
  jobId: string;
  initialProgress?: number;
  initialStage?: string;
  onCancel?: () => void;
  onComplete?: (result: any) => void;
}

export default function LiveMigrationTracker({
  jobId,
  initialProgress = 0,
  initialStage = 'Queued',
  onCancel,
  onComplete,
}: LiveMigrationTrackerProps) {
  const queryClient = useQueryClient();
  const { isConnected, lastMessage, logs } = useWebSocket(jobId);
  const [isPausing, setIsPausing] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const currentProgress = lastMessage?.progress ?? initialProgress;
  const currentStage = lastMessage?.stage ?? initialStage;
  const activeFile = lastMessage?.file;
  const isPaused = lastMessage?.type === 'paused';
  const isCompleted = lastMessage?.type === 'complete' || currentProgress === 100;
  const isFailed = lastMessage?.type === 'failed';

  useEffect(() => {
    if (isCompleted || isFailed) {
      queryClient.invalidateQueries({ queryKey: ['job', jobId] });
      queryClient.invalidateQueries({ queryKey: ['recentJobs'] });
    }
  }, [isCompleted, isFailed, jobId, queryClient]);

  if (isCompleted && lastMessage?.data && onComplete) {
    onComplete(lastMessage.data);
  }

  const handlePause = async () => {
    setIsPausing(true);
    try {
      await apiClient.post(`/api/jobs/${jobId}/pause`);
      toast.info('Migration task paused.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to pause job.');
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    setIsPausing(true);
    try {
      await apiClient.post(`/api/jobs/${jobId}/resume`);
      toast.success('Migration task resumed.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to resume job.');
    } finally {
      setIsPausing(false);
    }
  };

  const handleCancelJob = () => {
    setShowCancelModal(true);
  };

  const confirmCancelJob = async () => {
    setIsCancelling(true);
    try {
      await apiClient.post(`/api/jobs/${jobId}/cancel`);
      toast.success('Migration task cancelled.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to cancel job.');
    } finally {
      setIsCancelling(false);
      setShowCancelModal(false);
      onCancel?.();
    }
  };

  const handleRetryJob = async () => {
    try {
      await apiClient.post(`/api/jobs/${jobId}/retry`);
      toast.info('Retrying migration task...');
    } catch (err: any) {
      toast.error(err.message || 'Failed to retry job.');
    }
  };

  return (
    <Card className="bg-[#0B0B14] border-zinc-800/80 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-md font-bold text-white">Live Code Migration Engine</h3>
            {isConnected ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Wifi className="w-3 h-3" /> Live Socket
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <WifiOff className="w-3 h-3" /> Reconnecting...
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-xs mt-0.5 font-mono">Job ID: {jobId}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isCompleted && (
            <Button
              onClick={() => onCancel?.()}
              className="bg-primary hover:bg-primary/90 text-white text-xs px-3.5 py-1.5 font-bold shadow-glow"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" /> Start New Migration
            </Button>
          )}

          {!isCompleted && !isFailed && (
            isPaused ? (
              <Button
                onClick={handleResume}
                disabled={isPausing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 font-semibold"
              >
                {isPausing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />} Resume
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                disabled={isPausing}
                variant="secondary"
                className="text-xs px-3 py-1.5 font-semibold border-zinc-700"
              >
                {isPausing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Pause className="w-3.5 h-3.5 mr-1.5" />} Pause
              </Button>
            )
          )}

          {isFailed && (
            <Button onClick={handleRetryJob} className="bg-primary hover:bg-primary/90 text-white text-xs px-3 py-1.5 font-semibold">
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Retry
            </Button>
          )}

          {!isCompleted && (
            <Button onClick={handleCancelJob} variant="ghost" className="text-rose-400 hover:text-rose-300 text-xs px-3 py-1.5 font-semibold">
              <XCircle className="w-3.5 h-3.5 mr-1.5" /> Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar & Readouts */}
      <div className="space-y-3">
        {isCompleted && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-3.5 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">Migration Task Completed!</p>
                <p className="text-[11px] text-zinc-400">AST transformations finished successfully. Ready for next project.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onCancel?.()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-glow shrink-0 cursor-pointer"
            >
              Upload Next Project →
            </button>
          </div>
        )}

        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-white capitalize">{currentStage}</span>
          <span className="font-mono text-primary font-bold">{currentProgress}%</span>
        </div>

        <div className="w-full h-3 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isFailed ? 'bg-rose-500' : isPaused ? 'bg-amber-500' : 'bg-gradient-to-r from-[#7C6CFF] to-[#A68CFF]'
            }`}
            style={{ width: `${Math.min(currentProgress, 100)}%` }}
          />
        </div>

        {activeFile && (
          <p className="text-[11px] text-zinc-400 font-mono truncate">
            Active file: <span className="text-zinc-200">{activeFile}</span>
          </p>
        )}
      </div>

      {/* Live Terminal Log Output */}
      <div className="bg-[#05050A] border border-zinc-800/80 rounded-xl p-3 font-mono text-[11px] space-y-2">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] border-b border-zinc-800/60 pb-1.5">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-400">
            <Terminal className="w-3.5 h-3.5 text-primary" /> Real-time Transformation Stream
          </span>
          <span>{logs.length} events logged</span>
        </div>

        <div className="h-32 overflow-y-auto space-y-1 text-zinc-300 pr-1">
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <p key={idx} className="leading-relaxed hover:bg-zinc-800/20 px-1 rounded">
                {log}
              </p>
            ))
          ) : (
            <p className="text-zinc-600 italic">Subscribed to WebSocket channel. Waiting for code transformation events...</p>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Migration Task"
        message="Are you sure you want to cancel this migration task? Unsaved progress will be terminated."
        confirmText="Yes, Cancel Task"
        cancelText="Keep Running"
        variant="danger"
        loading={isCancelling}
        onConfirm={confirmCancelJob}
        onClose={() => setShowCancelModal(false)}
      />
    </Card>
  );
}
