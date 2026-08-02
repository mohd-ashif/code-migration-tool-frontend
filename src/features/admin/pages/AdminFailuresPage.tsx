import React, { useState } from 'react';
import { useAdminFailures, useUpdateFailureGroup } from '../hooks/useAdminExtendedAnalytics';
import { AlertTriangle } from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';

export const AdminFailuresPage: React.FC = () => {
  const { data: failures, isLoading } = useAdminFailures();
  const updateMutation = useUpdateFailureGroup();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeFailure, setActiveFailure] = useState<any | null>(null);

  const [editForm, setEditForm] = useState({
    status: 'investigating',
    assignedTo: 'Senior Architect',
    internalNotes: '',
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const filteredFailures = (failures || []).filter((f: any) => {
    if (selectedCategory === 'ALL') return true;
    return f.category?.toUpperCase() === selectedCategory.toUpperCase();
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFailure) return;

    updateMutation.mutate(
      {
        id: activeFailure.id || activeFailure.fingerprint,
        status: editForm.status,
        assignedTo: editForm.assignedTo,
        internalNotes: editForm.internalNotes,
      },
      {
        onSuccess: () => setActiveFailure(null),
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'investigating':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Failed Migration Triage Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grouped error fingerprints categorised by parser, AST, compiler, TypeScript, build, and AI self-healing stages.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {['ALL', 'Parser', 'TypeScript', 'Compiler', 'AI Healing', 'Timeout'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Failure Groups Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">Error Fingerprint / Category</th>
              <th className="p-4">Error Message</th>
              <th className="p-4">Occurrences</th>
              <th className="p-4">Last Seen</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Triage Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredFailures.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-slate-500">No failed migration fingerprints found in this category.</td></tr>
            ) : (
              filteredFailures.map((f: any) => (
                <tr key={f.id || f.fingerprint} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="font-mono font-bold text-indigo-400">{f.fingerprint}</div>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono mt-1 inline-block">
                      {f.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-rose-300 max-w-md truncate">{f.errorMessage}</td>
                  <td className="p-4 font-mono font-bold text-slate-100">{f.occurrenceCount}x</td>
                  <td className="p-4 font-mono text-slate-500">{new Date(f.lastSeenAt).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase ${getStatusBadge(f.status)}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setActiveFailure(f);
                        setEditForm({
                          status: f.status || 'investigating',
                          assignedTo: f.assignedToName || 'Senior Architect',
                          internalNotes: f.internalNotes || '',
                        });
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Investigate
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Triage & Investigation Modal */}
      {activeFailure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100">Failure Investigation Triage</h2>
                <div className="text-[11px] text-indigo-400 font-mono mt-0.5">{activeFailure.fingerprint}</div>
              </div>
              <button onClick={() => setActiveFailure(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-rose-500/30 text-rose-300 font-mono text-xs">
              {activeFailure.errorMessage}
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Investigation Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="unresolved">Unresolved</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Assign Lead Engineer</label>
                  <input
                    type="text"
                    value={editForm.assignedTo}
                    onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Internal Notes & Root Cause Analysis</label>
                <textarea
                  rows={3}
                  value={editForm.internalNotes}
                  onChange={(e) => setEditForm({ ...editForm, internalNotes: e.target.value })}
                  placeholder="Root cause identified in AST transformer rule #4..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveFailure(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Triage Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
