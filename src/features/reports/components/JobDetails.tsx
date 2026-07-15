import React, { useState } from 'react';
import { Download, FileCode, AlertCircle, FileText, ChevronRight, ChevronDown, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '../../../store';
import { useJob } from '../../jobs/hooks/useJob';
import { useMigrationReport } from '../hooks/useMigrationReport';
import { getDownloadUrl } from '../../jobs/api';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import Badge from '../../../shared/components/Badge';
import Progress from '../../../shared/components/Progress';
import Skeleton from '../../../shared/components/Skeleton';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import { fadeIn, defaultTransition } from '../../../animations/variants';

import QualityGateCard from './QualityGateCard';
import HealingLogs from './HealingLogs';
import WorkspaceEditor from '../../editor/components/WorkspaceEditor';

function parseReportDetails(summaryText: string) {
  const sections = {
    statistics: [] as string[],
    healedIssues: [] as string[],
    manualReviews: [] as string[],
    validationGates: [] as string[],
  };

  if (!summaryText) return sections;

  const lines = summaryText.split("\n");
  let currentSection: "stats" | "healed" | "manual" | "validation" | null = null;

  for (const line of lines) {
    if (line.includes("📊 Project Statistics:")) {
      currentSection = "stats";
      continue;
    }
    if (line.includes("🩹 AI Self-Healing Corrections:")) {
      currentSection = "healed";
      continue;
    }
    if (line.includes("⚠️ Manual Review Items:")) {
      currentSection = "manual";
      continue;
    }
    if (line.includes("VALIDATION REPORT")) {
      currentSection = "validation";
      continue;
    }
    if (line.includes("BUILD STATUS")) {
      currentSection = null;
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed || /^[=\-\*\s]+$/.test(trimmed)) continue;

    if (currentSection === "stats") {
      sections.statistics.push(trimmed);
    } else if (currentSection === "healed") {
      sections.healedIssues.push(trimmed.replace(/^([✓\+\-\*\s🩹]+)/, ""));
    } else if (currentSection === "manual") {
      sections.manualReviews.push(trimmed.replace(/^([✓\+\-\*\s⚠️]+)/, ""));
    } else if (currentSection === "validation") {
      if (trimmed.startsWith("✓")) {
        sections.validationGates.push(trimmed.replace(/^([✓\+\-\*\s]+)/, ""));
      }
    }
  }

  return sections;
}

const JobDetails = React.memo(function JobDetails() {
  const jobId = useAppSelector((state) => state.workspace.selectedJobId);
  const { job } = useJob(jobId);
  const { report, isLoading: isLoadingReport } = useMigrationReport(jobId, job?.status === 'completed');

  const [showFiles, setShowFiles] = useState(true);
  const [showRawReport, setShowRawReport] = useState(false);
  const [copiedLogs, setCopiedLogs] = useState(false);

  const handleCopyLogs = async () => {
    if (!report?.summary) return;
    try {
      await navigator.clipboard.writeText(report.summary);
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Loading job details from API initially or no job selected
  if (!job) {
    if (jobId) {
      return (
        <Card className="space-y-6">
          <div className="flex justify-between items-start gap-4 select-none animate-pulse">
            <div className="space-y-2 w-1/3">
              <Skeleton variant="text" width="60%" height={12} />
              <Skeleton variant="text" width="100%" height={20} />
            </div>
          </div>
          
          <div className="p-4 bg-card border border-border rounded-xl space-y-3.5 select-none">
            <div className="flex justify-between items-center">
              <Skeleton variant="text" width="20%" height={14} />
              <Skeleton variant="rectangular" width="25%" height={22} className="rounded-full" />
            </div>
          </div>

          {/* Report skeleton */}
          <div className="border border-border bg-card/35 rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5 select-none">
              <FileText className="w-4 h-4 text-primary" /> Migration Analysis Report
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton variant="text" width={180} height={16} />
              </div>
              <div className="space-y-2">
                <Skeleton variant="text" width="100%" height={12} />
                <Skeleton variant="text" width="90%" height={12} />
                <Skeleton variant="text" width="95%" height={12} />
              </div>
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border">
                <Skeleton variant="rectangular" height={54} />
                <Skeleton variant="rectangular" height={54} />
                <Skeleton variant="rectangular" height={54} />
              </div>
            </div>
          </div>
        </Card>
      );
    }

    return (
      <Card className="flex flex-col items-center justify-center text-center py-16 text-muted-foreground select-none border-dashed min-h-[220px]">
        <FileCode className="w-10 h-10 mb-3 text-muted-foreground shadow-glow animate-bounce" />
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">No Job Selected</h3>
        <p className="text-[10px] text-muted-foreground mt-1 max-w-[190px] leading-relaxed">
          Select a migration job from the left panel to inspect its diagnostics, healing logs, and generated files.
        </p>
      </Card>
    );
  }

  const migratedFiles = job.result?.migratedFiles || [];
  const parsedDetails = report ? parseReportDetails(report.summary) : null;
  const isInProgress = job.status === 'pending' || job.status === 'processing';

  return (
    <Card className="space-y-6">
      {/* Card Header details */}
      <div className="flex justify-between items-start gap-4 select-none">
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            Job Details
          </span>
          <h2 className="text-md font-bold font-mono text-foreground mt-1.5" title={job.id}>
            {job.id}
          </h2>
        </div>
        {job.status === 'completed' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.location.href = getDownloadUrl(job.id)}
            icon={<Download className="w-3.5 h-3.5" aria-hidden="true" />}
            aria-label="Download migrated workspace files as a ZIP archive"
          >
            Download ZIP
          </Button>
        )}
      </div>

      {/* Info strip */}
      <div className="p-4 bg-card border border-border rounded-xl space-y-3.5 select-none font-mono text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status:</span>
          <Badge status={job.status} />
        </div>

        {job.result?.targetFramework && (
          <div className="flex justify-between items-center border-t border-border pt-2.5">
            <span className="text-muted-foreground">Target Framework:</span>
            <span className="font-bold text-foreground capitalize bg-secondary px-2.5 py-0.5 rounded border border-border">
              {job.result.targetFramework}
            </span>
          </div>
        )}

        {isInProgress && (
          <div className="border-t border-border pt-3.5 space-y-2">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-muted-foreground">
                {job.status === 'pending' ? 'Queuing job...' : 'Migrating AST files...'}
              </span>
              <AnimatedCounter value={job.progress || 0} suffix="%" className="text-primary font-bold animate-pulse" />
            </div>
            <Progress value={job.progress || 0} max={100} />
          </div>
        )}

        {job.message && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="break-all font-mono leading-relaxed">{job.message}</div>
          </div>
        )}
      </div>

      {/* Report Section */}
      {(isInProgress || isLoadingReport) ? (
        <div className="border border-border bg-secondary/15 rounded-xl p-6 space-y-5 animate-pulse">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5 select-none">
            <FileText className="w-4 h-4 text-primary" /> Migration Analysis Report
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Skeleton variant="text" width={180} height={16} />
            </div>
            <div className="space-y-2">
              <Skeleton variant="text" width="100%" height={12} />
              <Skeleton variant="text" width="90%" height={12} />
              <Skeleton variant="text" width="95%" height={12} />
            </div>
            <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border">
              <Skeleton variant="rectangular" height={54} />
              <Skeleton variant="rectangular" height={54} />
              <Skeleton variant="rectangular" height={54} />
            </div>
          </div>
        </div>
      ) : report ? (
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="border border-border rounded-xl p-6 space-y-5 bg-card/25"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-2.5 select-none">
            <FileText className="w-4 h-4 text-primary" /> Migration Analysis Report
          </h3>

          {/* Quality check gates cards */}
          {parsedDetails && <QualityGateCard validationGates={parsedDetails.validationGates} />}

          {/* Healing Action logs */}
          {parsedDetails && (
            <HealingLogs
              healedIssues={parsedDetails.healedIssues}
              manualReviews={parsedDetails.manualReviews}
            />
          )}

          {/* Core Metrics counters row */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border select-none font-mono">
            <div className="bg-[#10101B]/55 border border-border p-2.5 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-primary">
                <AnimatedCounter value={report.metrics.migratedFiles} />
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Files</span>
            </div>
            <div className="bg-[#10101B]/55 border border-border p-2.5 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-warning">
                <AnimatedCounter value={report.metrics.warnings.length} />
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Warnings</span>
            </div>
            <div className="bg-[#10101B]/55 border border-border p-2.5 rounded-xl text-center">
              <span className="block text-xl font-extrabold text-destructive">
                <AnimatedCounter value={report.metrics.errors.length} />
              </span>
              <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Errors</span>
            </div>
          </div>

          {/* Toggle raw build output log */}
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setShowRawReport(!showRawReport)}
                aria-expanded={showRawReport}
                aria-label="Toggle raw compiler output log viewer"
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 select-none font-mono cursor-pointer"
              >
                {showRawReport ? <ChevronDown className="w-3.5 h-3.5 text-primary animate-pulse" aria-hidden="true" /> : <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />}
                {showRawReport ? "Hide Raw Compiler Output" : "Show Raw Compiler Output"}
              </button>
              {showRawReport && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyLogs} 
                  className="!p-1.5 h-7"
                  aria-label="Copy raw compiler output to clipboard"
                >
                  {copiedLogs ? <Check className="w-3.5 h-3.5 text-success" aria-hidden="true" /> : <Copy className="w-3.5 h-3.5" aria-hidden="true" />}
                </Button>
              )}
            </div>
            
            <AnimatePresence initial={false}>
              {showRawReport && (
                <motion.pre
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={defaultTransition}
                  className="p-3 bg-[#0B0B12] rounded-xl text-[10px] font-mono text-muted-foreground whitespace-pre-wrap border border-border max-h-[250px] overflow-y-auto leading-relaxed scrollbar block overflow-hidden"
                >
                  {report.summary}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}

      {/* Restructured Workspace File Explorer & Code Viewer */}
      {isInProgress ? (
        <div className="space-y-4 pt-4 border-t border-border select-none">
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Restructured Workspace Files
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* File Tree Left Skeleton */}
            <div className="md:col-span-4 flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                File Explorer
              </span>
              <div className="border border-border rounded-xl p-4 bg-card/15 h-[380px] space-y-3.5 animate-pulse">
                <Skeleton variant="text" width="80%" height={14} />
                <Skeleton variant="text" width="60%" height={14} />
                <Skeleton variant="text" width="70%" height={14} />
                <Skeleton variant="text" width="50%" height={14} />
                <Skeleton variant="text" width="75%" height={14} />
              </div>
            </div>

            {/* Code Viewer Right Skeleton */}
            <div className="md:col-span-8 flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                Code Viewer
              </span>
              <div className="border border-border bg-[#0E0F1A] rounded-2xl h-[380px] flex flex-col items-center justify-center text-center p-6 space-y-3 select-none">
                <div className="p-3 bg-secondary border border-border text-muted-foreground rounded-xl mb-2.5">
                  <FileCode className="w-5 h-5 animate-pulse text-[#7C6CFF]" />
                </div>
                <Skeleton variant="text" width="25%" height={12} className="mx-auto animate-pulse" />
                <Skeleton variant="text" width="45%" height={10} className="mx-auto mt-2 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ) : migratedFiles.length > 0 ? (
        <div className="space-y-4 pt-4 border-t border-border select-none animate-fadeIn">
          <button
            className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider w-full text-left font-mono mb-2 cursor-pointer"
            onClick={() => setShowFiles(!showFiles)}
            aria-expanded={showFiles}
            aria-label="Toggle restructured workspace file explorer and code viewer"
          >
            {showFiles ? <ChevronDown className="w-4 h-4 text-primary animate-pulse" aria-hidden="true" /> : <ChevronRight className="w-4 h-4" aria-hidden="true" />}
            Restructured Workspace Files ({migratedFiles.length})
          </button>

          <AnimatePresence initial={false}>
            {showFiles && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={defaultTransition}
              >
                <WorkspaceEditor
                  files={migratedFiles}
                  warnings={report?.metrics?.warnings}
                  errors={report?.metrics?.errors}
                  healedIssues={parsedDetails?.healedIssues}
                  manualReviews={parsedDetails?.manualReviews}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </Card>
  );
});

export default JobDetails;
