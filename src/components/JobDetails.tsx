import { useState, useEffect } from 'react';
import { Download, FileCode, CheckCircle2, AlertCircle, Clock, FileText, ChevronRight, ChevronDown, Sparkles, Shield } from 'lucide-react';
import { JobRecord, getDownloadUrl, generateReport } from '../services/api';

interface JobDetailsProps {
  job: JobRecord | null;
}

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
    if (!trimmed) continue;

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

export default function JobDetails({ job }: JobDetailsProps) {
  const [report, setReport] = useState<any | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [showFiles, setShowFiles] = useState(true);
  const [showRawReport, setShowRawReport] = useState(false);

  useEffect(() => {
    setReport(null);
    setSelectedFileIndex(null);
    setShowRawReport(false);
    if (job && job.status === 'completed') {
      fetchReport();
    }
  }, [job]);

  const fetchReport = async () => {
    if (!job) return;
    setLoadingReport(true);
    try {
      const res = await generateReport(job.id);
      if (res.success && res.report) {
        setReport(res.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReport(false);
    }
  };

  if (!job) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center py-16 text-gray-400">
        <FileCode className="w-12 h-12 mb-3 text-gray-300" />
        <p className="font-medium">No job selected</p>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Select a migration job from the list to view its details.</p>
      </div>
    );
  }

  const migratedFiles = job.result?.migratedFiles || [];
  const selectedFile = selectedFileIndex !== null ? migratedFiles[selectedFileIndex] : null;
  const parsedDetails = report ? parseReportDetails(report.summary) : null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
      <div className="flex justify-between items-start gap-4">
        <div>
          <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-500">JOB DETAILS</span>
          <h2 className="text-lg font-bold font-mono text-gray-900 mt-1 truncate max-w-[250px]" title={job.id}>
            {job.id}
          </h2>
        </div>
        {job.status === 'completed' && (
          <a
            href={getDownloadUrl(job.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download ZIP
          </a>
        )}
      </div>

      <div className="p-4 bg-gray-50 rounded-xl space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Status:</span>
          <span className="font-semibold capitalize flex items-center gap-1">
            {job.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-rose-500" />}
            {job.status === 'pending' && <Clock className="w-4 h-4 text-amber-500 animate-spin" />}
            {job.status}
          </span>
        </div>

        {job.result?.targetFramework && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Target Framework:</span>
            <span className="font-semibold capitalize">{job.result.targetFramework}</span>
          </div>
        )}

        {job.message && (
          <div className="p-2 bg-rose-50 text-rose-800 rounded border border-rose-100 text-xs font-mono">
            {job.message}
          </div>
        )}
      </div>

      {/* Migration Report */}
      {loadingReport ? (
        <div className="border border-gray-100 rounded-xl p-4 text-center text-xs text-gray-500">
          <Clock className="w-4 h-4 text-indigo-500 animate-spin mx-auto mb-1" />
          Loading report...
        </div>
      ) : report ? (
        <div className="border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5 border-b border-gray-50 pb-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Migration Summary
          </h3>

          {/* QA Gates */}
          {parsedDetails && parsedDetails.validationGates.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-500" /> Quality Gates Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {parsedDetails.validationGates.map((gate, i) => (
                  <div key={i} className="flex items-center gap-1.5 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-[11px] text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-medium truncate" title={gate}>{gate}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Self-Healing Corrections */}
          {parsedDetails && parsedDetails.healedIssues.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" /> AI Self-Healing Actions
              </h4>
              <div className="space-y-1">
                {parsedDetails.healedIssues.map((issue, i) => (
                  <div key={i} className="p-2 bg-indigo-50/50 border border-indigo-100/40 rounded-lg text-[11px] text-indigo-900 flex items-start gap-1.5">
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[8px] font-bold uppercase shrink-0 mt-0.5">HEALED</span>
                    <span className="leading-relaxed">{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Reviews */}
          {parsedDetails && parsedDetails.manualReviews.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> Action Items Recommended
              </h4>
              <div className="space-y-1">
                {parsedDetails.manualReviews.map((review, i) => (
                  <div key={i} className="p-2 bg-amber-50/50 border border-amber-100/40 rounded-lg text-[11px] text-amber-900 flex items-start gap-1.5">
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold uppercase shrink-0 mt-0.5">MANUAL</span>
                    <span className="leading-relaxed">{review}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-50">
            <div className="bg-gray-50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-indigo-600">{report.metrics.migratedFiles}</span>
              <span className="text-[10px] text-gray-400 uppercase">Files</span>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-amber-600">{report.metrics.warnings.length}</span>
              <span className="text-[10px] text-gray-400 uppercase">Warnings</span>
            </div>
            <div className="bg-gray-50 p-2 rounded text-center">
              <span className="block text-lg font-bold text-rose-600">{report.metrics.errors.length}</span>
              <span className="text-[10px] text-gray-400 uppercase">Errors</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setShowRawReport(!showRawReport)}
              className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
              {showRawReport ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {showRawReport ? "Hide Full Compiler Log" : "Show Full Compiler Log"}
            </button>
            {showRawReport && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-[10px] font-mono text-gray-600 whitespace-pre-wrap border border-gray-100 max-h-[300px] overflow-y-auto leading-relaxed">
                {report.summary}
              </pre>
            )}
          </div>
        </div>
      ) : null}

      {/* File List */}
      {migratedFiles.length > 0 && (
        <div className="space-y-2">
          <button 
            className="flex items-center gap-1 text-sm font-bold text-gray-800 w-full text-left"
            onClick={() => setShowFiles(!showFiles)}
          >
            {showFiles ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            Migrated Files ({migratedFiles.length})
          </button>

          {showFiles && (
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-[250px] overflow-y-auto">
              {migratedFiles.map((file, idx) => (
                <button
                  key={idx}
                  className={`w-full py-2.5 px-3 text-left text-xs font-mono truncate transition-colors flex items-center gap-2 ${
                    selectedFileIndex === idx ? "bg-indigo-50/50 text-indigo-600 font-semibold" : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => setSelectedFileIndex(selectedFileIndex === idx ? null : idx)}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0" />
                  {file.path}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Code Viewer Modal/Section */}
      {selectedFile && (
        <div className="border border-gray-150 rounded-xl overflow-hidden mt-4">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-150 flex justify-between items-center text-xs font-mono text-gray-600">
            <span>{selectedFile.path}</span>
          </div>
          <pre className="p-4 bg-gray-900 text-gray-100 text-xs font-mono overflow-x-auto max-h-[300px]">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
