import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Card from '../../../shared/components/Card';
import Badge from '../../../shared/components/Badge';
import PageHeader from '../../../shared/components/PageHeader';
import LoadingSpinner from '../../../shared/components/LoadingSpinner';
import { useToast } from '../../../shared/components/NotificationToast';
import { useWorkspace } from '../../../hooks/useWorkspace';
import { useFrameworks, useFrameworkDetail } from '../../../hooks/useFrameworks';
import { useUpdateEngine } from '../../../hooks/useMigrationEngines';
import { useUpdateCodemod, useUpdateCompilerSettings } from '../../../hooks/useCodemods';
import { useCompilerHealth } from '../../../hooks/useCompilerHealth';
import { useMigrationMatrix } from '../../../hooks/useMigrationMatrix';
import {
  Zap, Code, Globe, Activity, Shield, Cpu, BookOpen,
  Database, Sliders, Check, FileCode, X, ExternalLink,
  Layers, ArrowRight, XCircle, Search, Filter, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FrameworkDto } from '../../../shared/types/framework.types';

// Helper to render dynamic framework icon
function getFrameworkIcon(slug: string) {
  switch (slug) {
    case 'react':
      return <Code className="w-4 h-4 text-sky-400" />;
    case 'vue':
      return <Layers className="w-4 h-4 text-emerald-400" />;
    case 'angular':
      return <Shield className="w-4 h-4 text-rose-500" />;
    case 'nextjs':
      return <Globe className="w-4 h-4 text-indigo-400" />;
    case 'nuxt':
      return <Activity className="w-4 h-4 text-green-400" />;
    case 'svelte':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'solidjs':
      return <Cpu className="w-4 h-4 text-blue-400" />;
    case 'qwik':
      return <Sliders className="w-4 h-4 text-purple-400" />;
    case 'typescript':
      return <FileCode className="w-4 h-4 text-blue-500" />;
    case 'javascript':
      return <Database className="w-4 h-4 text-yellow-500" />;
    default:
      return <Code className="w-4 h-4 text-primary" />;
  }
}

// ── Memoized Framework Card Item ──────────────────────────────────────────────
const FrameworkCard = React.memo(({
  framework,
  onClick
}: {
  framework: FrameworkDto;
  onClick: (id: string) => void;
}) => {
  return (
    <Card
      onClick={() => onClick(framework.id)}
      className="flex flex-col justify-between hover:border-primary/20 hover:shadow-glow transition-all duration-300 cursor-pointer group"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl shadow-glow group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
            {getFrameworkIcon(framework.slug)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-mono">{framework.displayName}</h4>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">Version: {framework.currentVersion}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono">
            Configure →
          </span>
          <Badge status={framework.status === 'active' ? 'completed' : framework.status === 'maintenance' ? 'warning' : 'failed'} label={framework.status} />
        </div>
      </div>

      <p className="text-xs text-gray-400 font-sans mt-3 line-clamp-2 leading-relaxed">
        {framework.description}
      </p>

      <div className="mt-6 flex justify-between items-center border-t border-[#1E1F35] pt-4 text-[10px] font-mono text-gray-500">
        <span className="flex items-center gap-1">
          Success Rate: <strong className="text-success">{framework.avgSuccessRate ? `${framework.avgSuccessRate.toFixed(1)}%` : 'N/A'}</strong>
        </span>
        <span>
          Active Codemods: <strong className="text-white">{framework.codemodCount ?? 0}</strong>
        </span>
      </div>
    </Card>
  );
});

// ── Detail Drawer Slider component ───────────────────────────────────────────
function FrameworkDetailPanel({
  frameworkId,
  onClose,
  isAdmin
}: {
  frameworkId: string;
  onClose: () => void;
  isAdmin: boolean;
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'engines' | 'codemods' | 'settings' | 'matrix'>('overview');

  const { data: detail, isLoading } = useFrameworkDetail(frameworkId);

  // Mutations
  const updateEngineMutation = useUpdateEngine();
  const updateCodemodMutation = useUpdateCodemod();
  const updateSettingsMutation = useUpdateCompilerSettings();

  // Settings State Form
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  React.useEffect(() => {
    if (detail?.settings) {
      setSettingsForm(detail.settings);
    }
  }, [detail]);

  // Engines Update handlers
  const handleEngineStatusChange = async (engineId: string, status: any) => {
    try {
      await updateEngineMutation.mutateAsync({ id: engineId, patch: { status } });
      toast.success('Engine status updated successfully.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update engine status.');
    }
  };

  const handleEngineOptimizationChange = async (engineId: string, optimizationLevel: any) => {
    try {
      await updateEngineMutation.mutateAsync({ id: engineId, patch: { optimizationLevel } });
      toast.success('Engine optimization updated.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update optimization.');
    }
  };

  // Codemod Toggle state
  const handleCodemodToggle = async (codemodId: string, enabled: boolean) => {
    try {
      await updateCodemodMutation.mutateAsync({ id: codemodId, patch: { enabled } });
      toast.success(`Codemod ${enabled ? 'enabled' : 'disabled'} successfully.`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to update codemod.');
    }
  };

  const handleCodemodPriorityChange = async (codemodId: string, priority: number) => {
    try {
      await updateCodemodMutation.mutateAsync({ id: codemodId, patch: { priority } });
      toast.success('Codemod priority updated.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update priority.');
    }
  };

  // Compiler Settings Save
  const handleSettingsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    setIsSettingsSaving(true);
    try {
      await updateSettingsMutation.mutateAsync({
        frameworkId,
        patch: {
          parallelProcessing: settingsForm.parallelProcessing,
          optimization: settingsForm.optimization,
          treeShaking: settingsForm.treeShaking,
          sourceMaps: settingsForm.sourceMaps,
          strictMode: settingsForm.strictMode,
          experimentalFeatures: settingsForm.experimentalFeatures,
          maxFileSize: Number(settingsForm.maxFileSize),
          timeout: Number(settingsForm.timeout),
          memoryLimit: Number(settingsForm.memoryLimit)
        }
      });
      toast.success('Compiler settings updated.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save settings.');
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'engines', name: 'Engines' },
    { id: 'codemods', name: 'Codemods' },
    { id: 'settings', name: 'Compiler Settings' },
    { id: 'matrix', name: 'Migrations Matrix' }
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-2xl bg-[#090A15]/95 border-l border-[#1E1F35] h-full shadow-2xl overflow-y-auto flex flex-col backdrop-blur-md text-white"
    >
      {/* Header */}
      <div className="p-6 border-b border-[#1E1F35] flex items-center justify-between">
        {detail ? (
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
              {getFrameworkIcon(detail.framework.slug)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono">{detail.framework.displayName}</h3>
                <Badge status={detail.framework.status === 'active' ? 'completed' : 'warning'} label={detail.framework.status} />
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {detail.framework.id}</p>
            </div>
          </div>
        ) : (
          <div className="h-10 w-48 bg-[#15162B] animate-pulse rounded-lg" />
        )}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg border border-[#1E1F35] hover:bg-[#1E1F35] text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#1E1F35] px-6 py-2 overflow-x-auto gap-2 bg-[#0C0E20]/55">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-xs font-mono rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-gray-400 hover:text-white hover:bg-[#1E1F35]/40 border border-transparent'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <LoadingSpinner size="lg" className="text-primary" />
            <p className="text-xs text-gray-400 font-mono animate-pulse">Loading framework data...</p>
          </div>
        ) : detail ? (
          <>
            {/* OVERVIEW PANEL */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-2">Description</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-sans">{detail.framework.description || 'No description available.'}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-[#15162B]/50 border border-[#1E1F35] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Category</p>
                    <p className="text-sm font-bold text-white mt-1 capitalize">{detail.framework.category.replace('-', ' ')}</p>
                  </div>
                  <div className="p-4 bg-[#15162B]/50 border border-[#1E1F35] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Success Rate</p>
                    <p className="text-sm font-bold text-success mt-1">{detail.framework.avgSuccessRate ? `${detail.framework.avgSuccessRate.toFixed(1)}%` : 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-[#15162B]/50 border border-[#1E1F35] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Migrations</p>
                    <p className="text-sm font-bold text-indigo-400 mt-1">{detail.framework.migrationsRun ?? 0}</p>
                  </div>
                  <div className="p-4 bg-[#15162B]/50 border border-[#1E1F35] rounded-xl text-center">
                    <p className="text-[10px] text-gray-500 font-mono uppercase">Active Codemods</p>
                    <p className="text-sm font-bold text-white mt-1">{detail.framework.codemodCount ?? 0}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  {detail.framework.homepageUrl && (
                    <a
                      href={detail.framework.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                    >
                      <Globe className="w-3.5 h-3.5" /> Homepage <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {detail.framework.documentationUrl && (
                    <a
                      href={detail.framework.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline font-mono"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Documentation <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Versions list */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider mb-3">Version Release History</h4>
                  <div className="border border-[#1E1F35] rounded-xl overflow-hidden divide-y divide-[#1E1F35]">
                    {detail.versions.map((ver) => (
                      <div key={ver.id} className="p-3 hover:bg-[#1E1F35]/20 flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="font-bold text-white">{ver.version}</span>
                          {ver.isLatest && <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-primary/25 border border-primary/45 rounded-md text-primary">Latest</span>}
                          {ver.releaseDate && <span className="text-[10px] text-gray-500 ml-3">Released: {ver.releaseDate}</span>}
                        </div>
                        <span className="text-gray-400 text-[10px]">Min Node: {ver.minimumNodeVersion ?? 'Any'}</span>
                      </div>
                    ))}
                    {detail.versions.length === 0 && (
                      <div className="p-4 text-center text-gray-500 text-xs font-mono">No release logs found.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ENGINES PANEL */}
            {activeTab === 'engines' && (
              <div className="space-y-4 animate-fadeIn">
                {detail.engines.map((engine) => (
                  <div key={engine.id} className="p-5 border border-[#1E1F35] bg-[#121324]/55 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-sm font-bold text-white font-mono">{engine.engineName}</h5>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Type: <span className="text-indigo-400">{engine.engineType}</span></p>
                      </div>
                      <Badge status={engine.status === 'active' ? 'completed' : engine.status === 'maintenance' ? 'warning' : 'failed'} label={engine.status} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-b border-[#1E1F35]/50 py-3 text-[10px] font-mono text-gray-400">
                      <div>
                        Migrations Run: <strong className="text-white">{engine.migrationsRun}</strong>
                      </div>
                      <div>
                        Avg Duration: <strong className="text-white">{engine.avgDurationMs}ms</strong>
                      </div>
                      <div>
                        Compiler v{engine.compilerVersion}
                      </div>
                    </div>

                    {isAdmin ? (
                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Status</label>
                          <select
                            value={engine.status}
                            onChange={(e) => handleEngineStatusChange(engine.id, e.target.value as any)}
                            className="w-full bg-[#1A1C36] border border-[#2D305C] rounded-lg text-xs p-2 text-white outline-none focus:border-primary font-mono cursor-pointer"
                          >
                            <option value="active">Active</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="inactive">Inactive</option>
                            <option value="experimental">Experimental</option>
                            <option value="deprecated">Deprecated</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 font-mono uppercase mb-1">Optimizations</label>
                          <select
                            value={engine.optimizationLevel}
                            onChange={(e) => handleEngineOptimizationChange(engine.id, e.target.value as any)}
                            className="w-full bg-[#1A1C36] border border-[#2D305C] rounded-lg text-xs p-2 text-white outline-none focus:border-primary font-mono cursor-pointer"
                          >
                            <option value="ultra">Ultra (AST Pre-map)</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low (None)</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 p-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-mono">
                        <Lock className="w-3.5 h-3.5" /> Read-only mode: Only Workspace Owners (Admin) can configure compiler optimizations.
                      </div>
                    )}
                  </div>
                ))}
                {detail.engines.length === 0 && (
                  <div className="text-center py-12 text-gray-500 text-xs font-mono">No AST compilers attached.</div>
                )}
              </div>
            )}

            {/* CODEMODS PANEL */}
            {activeTab === 'codemods' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border border-[#1E1F35] bg-[#121324]/55 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-[#1A1C36]/55 border-b border-[#1E1F35] p-3 text-[10px] uppercase font-mono text-gray-500">
                    <span className="col-span-5">Name & Description</span>
                    <span className="col-span-3 text-center">Priority</span>
                    <span className="col-span-2 text-center">Version</span>
                    <span className="col-span-2 text-right">Status</span>
                  </div>
                  <div className="divide-y divide-[#1E1F35]/50">
                    {detail.codemods.map((code) => (
                      <div key={code.id} className="grid grid-cols-12 p-3 items-center text-xs font-mono">
                        <div className="col-span-5 space-y-0.5">
                          <p className="font-bold text-white">{code.name}</p>
                          <p className="text-[10px] text-gray-400 leading-snug line-clamp-1">{code.description}</p>
                        </div>
                        <div className="col-span-3 text-center">
                          {isAdmin ? (
                            <select
                              value={code.priority}
                              onChange={(e) => handleCodemodPriorityChange(code.id, Number(e.target.value))}
                              className="bg-[#1A1C36] border border-[#2D305C] rounded p-1 text-[10px] text-white outline-none cursor-pointer font-mono"
                            >
                              {[...Array(10)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#1E1F35] rounded text-[10px] text-indigo-400 font-bold">{code.priority}</span>
                          )}
                        </div>
                        <div className="col-span-2 text-center text-gray-400 text-[10px]">
                          v{code.version}
                        </div>
                        <div className="col-span-2 text-right">
                          {isAdmin ? (
                            <button
                              onClick={() => handleCodemodToggle(code.id, !code.enabled)}
                              className={`px-3 py-1 rounded text-[10px] font-bold font-mono transition-colors ${
                                code.enabled
                                  ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25'
                                  : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/25'
                              }`}
                            >
                              {code.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          ) : (
                            <Badge status={code.enabled ? 'completed' : 'failed'} label={code.enabled ? 'Enabled' : 'Disabled'} />
                          )}
                        </div>
                      </div>
                    ))}
                    {detail.codemods.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-xs font-mono">No AST codemods registered.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS PANEL */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn">
                {settingsForm ? (
                  <form onSubmit={handleSettingsSave} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Toggles */}
                      <div className="space-y-3 bg-[#121324]/55 border border-[#1E1F35] p-4 rounded-xl">
                        <h5 className="text-[10px] text-gray-500 font-mono uppercase border-b border-[#1E1F35] pb-2 mb-2">Engine Flags</h5>
                        
                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.parallelProcessing}
                            onChange={(e) => setSettingsForm({ ...settingsForm, parallelProcessing: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>Parallel Compiling</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.optimization}
                            onChange={(e) => setSettingsForm({ ...settingsForm, optimization: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>AST Optimizer</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.treeShaking}
                            onChange={(e) => setSettingsForm({ ...settingsForm, treeShaking: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>Tree-Shaking Resolver</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.sourceMaps}
                            onChange={(e) => setSettingsForm({ ...settingsForm, sourceMaps: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>Generate Source Maps</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.strictMode}
                            onChange={(e) => setSettingsForm({ ...settingsForm, strictMode: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>Strict Mode Parsing</span>
                        </label>

                        <label className="flex items-center gap-3 text-xs font-mono cursor-pointer">
                          <input
                            type="checkbox"
                            disabled={!isAdmin}
                            checked={settingsForm.experimentalFeatures}
                            onChange={(e) => setSettingsForm({ ...settingsForm, experimentalFeatures: e.target.checked })}
                            className="w-4 h-4 rounded accent-primary bg-[#1A1C36] border border-[#2D305C]"
                          />
                          <span>Experimental Transforms</span>
                        </label>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-4 bg-[#121324]/55 border border-[#1E1F35] p-4 rounded-xl">
                        <h5 className="text-[10px] text-gray-500 font-mono uppercase border-b border-[#1E1F35] pb-2 mb-2">Tuning Benchmarks</h5>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Max File size (KB)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={10240}
                            disabled={!isAdmin}
                            value={settingsForm.maxFileSize}
                            onChange={(e) => setSettingsForm({ ...settingsForm, maxFileSize: e.target.value })}
                            className="w-full bg-[#1A1C36] border border-[#2D305C] rounded-lg text-xs p-2 text-white outline-none focus:border-primary font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">Transform Timeout (s)</label>
                          <input
                            type="number"
                            required
                            min={5}
                            max={300}
                            disabled={!isAdmin}
                            value={settingsForm.timeout}
                            onChange={(e) => setSettingsForm({ ...settingsForm, timeout: e.target.value })}
                            className="w-full bg-[#1A1C36] border border-[#2D305C] rounded-lg text-xs p-2 text-white outline-none focus:border-primary font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-gray-400 font-mono uppercase mb-1">RAM Memory Limit (MB)</label>
                          <input
                            type="number"
                            required
                            min={64}
                            max={4096}
                            disabled={!isAdmin}
                            value={settingsForm.memoryLimit}
                            onChange={(e) => setSettingsForm({ ...settingsForm, memoryLimit: e.target.value })}
                            className="w-full bg-[#1A1C36] border border-[#2D305C] rounded-lg text-xs p-2 text-white outline-none focus:border-primary font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {isAdmin ? (
                      <button
                        type="submit"
                        disabled={isSettingsSaving}
                        className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-mono font-bold text-xs py-3 px-4 rounded-xl border border-primary/20 hover:border-primary/40 shadow-glow transition-all duration-300 disabled:opacity-50"
                      >
                        {isSettingsSaving ? (
                          <>
                            <LoadingSpinner size="sm" className="text-white" /> Saving configuration...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" /> Save compiler settings
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 rounded-xl text-[10px] font-mono justify-center">
                        <Lock className="w-4 h-4" /> Editing settings is limited to Workspace Owners.
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs font-mono">No settings configuration model found.</div>
                )}
              </div>
            )}

            {/* MATRIX PANEL */}
            {activeTab === 'matrix' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="border border-[#1E1F35] bg-[#121324]/55 rounded-xl overflow-hidden">
                  <div className="grid grid-cols-12 bg-[#1A1C36]/55 border-b border-[#1E1F35] p-3 text-[10px] uppercase font-mono text-gray-500">
                    <span className="col-span-5">Migration route</span>
                    <span className="col-span-3 text-center">Stability</span>
                    <span className="col-span-2 text-center">Quality</span>
                    <span className="col-span-2 text-right">Success %</span>
                  </div>
                  <div className="divide-y divide-[#1E1F35]/50">
                    {detail.supportedMigrations.map((m) => (
                      <div key={m.id} className="grid grid-cols-12 p-3 items-center text-xs font-mono">
                        <div className="col-span-5 flex items-center gap-2">
                          <span className="font-bold text-white capitalize">{m.sourceName}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-gray-300 capitalize">{m.targetName}</span>
                        </div>
                        <div className="col-span-3 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                            m.stability === 'stable'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : m.stability === 'beta'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}>
                            {m.stability}
                          </span>
                        </div>
                        <div className="col-span-2 text-center text-white font-bold">{m.qualityScore}/100</div>
                        <div className="col-span-2 text-right text-success font-bold">{m.estimatedSuccessRate.toFixed(1)}%</div>
                      </div>
                    ))}
                    {detail.supportedMigrations.length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-xs font-mono">No direct source/target paths linked.</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500 text-xs font-mono">Failed to fetch data envelope.</div>
        )}
      </div>
    </motion.div>
  );
}

// ── TargetFrameworks Main Component ───────────────────────────────────────────
export default function TargetFrameworks() {
  const { workspace } = useWorkspace();
  const isAdmin = workspace?.role === 'owner';

  // Live Queries
  const { data: frameworks = [], isLoading: isFwLoading, error: fwError } = useFrameworks();
  const { data: health } = useCompilerHealth();
  const { data: matrix = [] } = useMigrationMatrix();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected framework for panel
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);

  // Compute live widgets stats
  const stats = useMemo(() => {
    const totalFws = frameworks.length;
    const supportedRoutes = matrix.filter((m) => m.supported).length;
    const engineCount = health?.engines ?? 0;

    // sum active codemods from frameworks
    const activeCodemods = frameworks.reduce((acc, curr) => acc + (curr.codemodCount ?? 0), 0);

    // avg success rate
    const validRates = frameworks.filter((f) => f.avgSuccessRate != null && f.avgSuccessRate > 0);
    const avgSuccess = validRates.length
      ? validRates.reduce((acc, curr) => acc + (curr.avgSuccessRate ?? 0), 0) / validRates.length
      : 85.0;

    // compiler health label
    let healthLabel = 'Degraded';
    if (health) {
      if (health.failed === 0 && health.warnings === 0) {
        healthLabel = '100% Healthy';
      } else if (health.failed === 0) {
        healthLabel = 'Degraded (LTS Warning)';
      } else {
        healthLabel = `Offline (${health.failed} down)`;
      }
    } else {
      healthLabel = 'Normal';
    }

    return {
      totalFws,
      supportedRoutes,
      engineCount,
      activeCodemods,
      avgSuccess,
      healthLabel
    };
  }, [frameworks, health, matrix]);

  // Filter frameworks list based on search/status
  const filteredFrameworks = useMemo(() => {
    return frameworks.filter((fw) => {
      const matchSearch = fw.displayName.toLowerCase().includes(search.toLowerCase()) ||
                          (fw.description && fw.description.toLowerCase().includes(search.toLowerCase())) ||
                          fw.category.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || fw.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [frameworks, search, statusFilter]);

  const handleCardClick = useCallback((id: string) => {
    setSelectedFrameworkId(id);
  }, []);

  const handlePanelClose = useCallback(() => {
    setSelectedFrameworkId(null);
  }, []);

  if (isFwLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-xs text-gray-500 font-mono animate-pulse">// Syncing compiler engines & DB mappings...</p>
      </div>
    );
  }

  if (fwError) {
    return (
      <div className="p-8 border border-rose-500/20 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center gap-3 font-mono text-xs">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <p className="font-bold">Failed to load compilers pipeline</p>
          <p className="text-[10px] text-rose-300 mt-1">{(fwError as any).message || 'Database server is unreachable.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <PageHeader
        title="Compiler Engine Management"
        subtitle="Live control console for AST mapping compiler engines, optimization parameters, and codemods."
      />

      {/* Analytics widgets row */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Frameworks</p>
          <p className="text-lg font-bold text-white mt-1.5 font-mono">{stats.totalFws}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Migrations Supported</p>
          <p className="text-lg font-bold text-white mt-1.5 font-mono">{stats.supportedRoutes}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Compiler Engines</p>
          <p className="text-lg font-bold text-white mt-1.5 font-mono">{stats.engineCount}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Active Codemods</p>
          <p className="text-lg font-bold text-white mt-1.5 font-mono">{stats.activeCodemods}</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Avg Success Rate</p>
          <p className="text-lg font-bold text-success mt-1.5 font-mono">{stats.avgSuccess.toFixed(1)}%</p>
        </div>
        <div className="p-4 bg-card border border-border rounded-2xl flex flex-col justify-between">
          <p className="text-[10px] font-mono text-gray-500 uppercase">Compiler Health</p>
          <p className={`text-xs font-bold mt-2 font-mono ${stats.healthLabel.includes('100%') ? 'text-success' : 'text-warning'}`}>{stats.healthLabel}</p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#111225]/45 border border-[#1E1F35] p-3 rounded-2xl">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search compilers, slug aliases, features..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#16172D] border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-primary/50 transition-all font-mono"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#16172D] border border-border rounded-xl text-xs px-3 py-2 text-white outline-none focus:border-primary/50 transition-all font-mono cursor-pointer"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="experimental">Experimental</option>
            <option value="deprecated">Deprecated</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFrameworks.map((fw) => (
          <FrameworkCard
            key={fw.id}
            framework={fw}
            onClick={handleCardClick}
          />
        ))}
        {filteredFrameworks.length === 0 && (
          <div className="col-span-2 p-12 border border-dashed border-border rounded-2xl text-center text-gray-500 font-mono text-xs">
            No compilers mapping the search criteria were found.
          </div>
        )}
      </div>

      {/* Slide-over details drawer panel */}
      {createPortal(
        <AnimatePresence>
          {selectedFrameworkId && (
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex justify-end"
              onClick={handlePanelClose}
            >
              <FrameworkDetailPanel
                frameworkId={selectedFrameworkId}
                onClose={handlePanelClose}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
