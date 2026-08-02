import React, { useState } from 'react';
import {
  useAdminPlans,
  useCreatePlan,
  usePublishPlan,
  useUnpublishPlan,
  useArchivePlan,
  useDuplicatePlan,
  AdminPlan,
} from '../hooks/useAdminPlans';
import { Plus, Copy, Archive, CheckCircle2, XCircle, Sparkles, Layers } from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';

export const AdminPlansPage: React.FC = () => {
  const { data: plans, isLoading } = useAdminPlans();
  const createMutation = useCreatePlan();
  const publishMutation = usePublishPlan();
  const unpublishMutation = useUnpublishPlan();
  const archiveMutation = useArchivePlan();
  const duplicateMutation = useDuplicatePlan();

  const [modalOpen, setModalOpen] = useState(false);
  const [archiveTargetId, setArchiveTargetId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    monthlyPrice: 999,
    yearlyPrice: 9999,
    currency: 'INR',
    trialDays: 0,
    displayOrder: 1,
    isPublic: true,
    isRecommended: false,
    migrationsLimit: '100',
    storageLimitMb: '5000',
    teamMembersLimit: '5',
    aiRequestsLimit: '1000',
    maxUploadMb: '500',
    concurrentJobs: '2',
    dependencyGraph: true,
    aiSelfHealing: true,
    advancedReports: true,
    apiAccess: true,
    folderUpload: true,
    priorityQueue: false,
  });

  const handleSlugify = (nameStr: string) => {
    return nameStr.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        name: formData.name,
        slug: formData.slug || handleSlugify(formData.name),
        description: formData.description,
        monthlyPrice: Number(formData.monthlyPrice),
        yearlyPrice: Number(formData.yearlyPrice),
        currency: formData.currency,
        trialDays: Number(formData.trialDays),
        displayOrder: Number(formData.displayOrder),
        isPublic: formData.isPublic,
        isRecommended: formData.isRecommended,
        features: {
          migrations_limit: formData.migrationsLimit,
          storage_limit_bytes: String(Number(formData.storageLimitMb) * 1024 * 1024),
          team_members_limit: formData.teamMembersLimit,
          ai_requests_limit: formData.aiRequestsLimit,
          dependency_graph: String(formData.dependencyGraph),
          ai_self_healing: String(formData.aiSelfHealing),
          advanced_reports: String(formData.advancedReports),
          api_access: String(formData.apiAccess),
          folder_upload: String(formData.folderUpload),
          priority_queue: String(formData.priorityQueue),
        },
      },
      {
        onSuccess: () => {
          setModalOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const getStatusBadge = (status: AdminPlan['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'DRAFT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'INACTIVE':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'ARCHIVED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Subscription Packages & Entitlements</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, configure, version, and publish pricing packages without code deployments.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </button>
      </div>

      {/* Plans Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Package</th>
                <th className="p-4">Monthly</th>
                <th className="p-4">Yearly</th>
                <th className="p-4">Version</th>
                <th className="p-4">Subscribers</th>
                <th className="p-4">Status</th>
                <th className="p-4">Visibility</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {plans?.map((plan) => (
                <tr key={plan.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="font-semibold text-slate-200 text-sm">{plan.name}</div>
                      {plan.isRecommended && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{plan.slug}</div>
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-200">
                    ₹{plan.monthlyPrice.toLocaleString()} / mo
                  </td>
                  <td className="p-4 font-mono text-slate-400">
                    ₹{plan.yearlyPrice.toLocaleString()} / yr
                  </td>
                  <td className="p-4 font-mono text-xs text-indigo-400 font-semibold">
                    v{plan.version}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                      {plan.subscriberCount} active
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${getStatusBadge(plan.status)}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {plan.isPublic ? (
                      <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Public
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Private
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {plan.status === 'DRAFT' || plan.status === 'INACTIVE' ? (
                      <button
                        onClick={() => publishMutation.mutate(plan.id)}
                        className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Publish
                      </button>
                    ) : plan.status === 'ACTIVE' ? (
                      <button
                        onClick={() => unpublishMutation.mutate(plan.id)}
                        className="px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        Unpublish
                      </button>
                    ) : null}

                    <button
                      onClick={() => duplicateMutation.mutate(plan.id)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                      title="Duplicate Package"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    {plan.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => setArchiveTargetId(plan.id)}
                        className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition cursor-pointer"
                        title="Archive Package"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Package Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl my-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-slate-100">Create New Subscription Package</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: handleSlugify(e.target.value) })}
                    placeholder="e.g. Professional"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="professional"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tailored for growing engineering teams..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.monthlyPrice}
                    onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.yearlyPrice}
                    onChange={(e) => setFormData({ ...formData, yearlyPrice: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Entitlements & Feature Limits */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-200 text-xs">Plan Limits (-1 for Unlimited)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Migrations / Month</label>
                    <input
                      type="text"
                      value={formData.migrationsLimit}
                      onChange={(e) => setFormData({ ...formData, migrationsLimit: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Storage (MB)</label>
                    <input
                      type="text"
                      value={formData.storageLimitMb}
                      onChange={(e) => setFormData({ ...formData, storageLimitMb: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Team Members</label>
                    <input
                      type="text"
                      value={formData.teamMembersLimit}
                      onChange={(e) => setFormData({ ...formData, teamMembersLimit: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">AI Requests</label>
                    <input
                      type="text"
                      value={formData.aiRequestsLimit}
                      onChange={(e) => setFormData({ ...formData, aiRequestsLimit: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 font-mono"
                    />
                  </div>
                </div>

                <h3 className="font-bold text-slate-200 text-xs pt-2">Feature Capabilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-300">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.dependencyGraph}
                      onChange={(e) => setFormData({ ...formData, dependencyGraph: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Dependency Graph</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aiSelfHealing}
                      onChange={(e) => setFormData({ ...formData, aiSelfHealing: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>AI Self-Healing</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.advancedReports}
                      onChange={(e) => setFormData({ ...formData, advancedReports: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Advanced Reports</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.apiAccess}
                      onChange={(e) => setFormData({ ...formData, apiAccess: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>API Access</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.folderUpload}
                      onChange={(e) => setFormData({ ...formData, folderUpload: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Folder Upload</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.priorityQueue}
                      onChange={(e) => setFormData({ ...formData, priorityQueue: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>Priority Worker Queue</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl"
                >
                  {createMutation.isPending ? 'Creating Draft...' : 'Save as Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(archiveTargetId)}
        onClose={() => setArchiveTargetId(null)}
        onConfirm={() => {
          if (archiveTargetId) archiveMutation.mutate(archiveTargetId);
          setArchiveTargetId(null);
        }}
        title="Archive Subscription Package"
        message="Archiving a package prevents new customer signups. Existing paid subscribers will continue to function normally."
        confirmLabel="Archive Package"
        isDestructive={true}
      />
    </div>
  );
};
