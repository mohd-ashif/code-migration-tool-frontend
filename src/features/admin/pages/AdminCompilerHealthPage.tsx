import React from 'react';
import { useCompilerHealth } from '../hooks/useAdmin';
import { Activity, Cpu, Server, Database, Layers } from 'lucide-react';
import { Skeleton } from '../../../components/ui/Skeleton';

export const AdminCompilerHealthPage: React.FC = () => {
  const { data, isLoading } = useCompilerHealth();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 bg-slate-900 border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  const services = data?.services || {};
  const queue = data?.queue || {};
  const engines = data?.engines || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Compiler Infrastructure & Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">Live operational visibility across Redis, BullMQ queue depth, database, and AST engines.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">Status: {data?.status}</span>
        </div>
      </div>

      {/* Core Infrastructure Services */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <Server className="w-8 h-8 text-indigo-400" />
          <div>
            <div className="text-xs text-slate-400">Node.js API Server</div>
            <div className="text-lg font-bold text-slate-100">{services.api || 'Healthy'}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <Database className="w-8 h-8 text-blue-400" />
          <div>
            <div className="text-xs text-slate-400">PostgreSQL Pool</div>
            <div className="text-lg font-bold text-slate-100">{services.postgres || 'Healthy'}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <Layers className="w-8 h-8 text-red-400" />
          <div>
            <div className="text-xs text-slate-400">Redis Cache & PubSub</div>
            <div className="text-lg font-bold text-slate-100">{services.redis || 'Healthy'}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
          <Cpu className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-xs text-slate-400">BullMQ Workers</div>
            <div className="text-lg font-bold text-slate-100">{services.bullmq || 'Healthy'}</div>
          </div>
        </div>
      </div>

      {/* Queue Depth & Active Metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Queue Depth & Worker Throughput</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-bold text-amber-400">{queue.waiting ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">Waiting in Queue</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-bold text-cyan-400">{queue.active ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">Active Workers</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-bold text-emerald-400">{queue.completed ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">Total Completed</div>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div className="text-2xl font-bold text-red-400">{queue.failed ?? 0}</div>
            <div className="text-xs text-slate-400 mt-1">Total Failed</div>
          </div>
        </div>
      </div>

      {/* AST Migration Engines Catalog */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">AST Codemod Migration Engines</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {engines.map((e: any) => (
            <div key={e.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-200 text-sm">{e.name} Engine</div>
                <div className="text-xs text-slate-400 mt-0.5">{e.migrationsRun} runs • {e.avgDurationMs}ms avg</div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                e.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {e.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
