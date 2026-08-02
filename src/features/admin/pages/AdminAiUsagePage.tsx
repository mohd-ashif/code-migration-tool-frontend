import { useAdminAiUsage } from '../hooks/useAdminExtendedAnalytics';
import { Sparkles, Cpu, TrendingUp } from 'lucide-react';
import Skeleton from '../../../components/ui/Skeleton';

export const AdminAiUsagePage: React.FC = () => {
  const { data: aiData, isLoading } = useAdminAiUsage();

  if (isLoading || !aiData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-96 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const { totalRevenue, totalProviderCost, grossMarginPercent, inputTokens, outputTokens, modelBreakdown } = aiData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          <span>AI Usage & Cost Center</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Unit economics tracking customer subscription revenue against AI provider infrastructure costs.
        </p>
      </div>

      {/* Financial Unit Economics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Customer Revenue</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">₹{totalRevenue.toLocaleString()}</div>
          <div className="text-[10px] text-slate-500 mt-1">Captured subscription payments</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">AI Provider Cost</div>
          <div className="text-2xl font-bold text-rose-400 font-mono mt-1">${totalProviderCost.toFixed(2)}</div>
          <div className="text-[10px] text-slate-500 mt-1">Anthropic & OpenAI API billing</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Gross AI Margin</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{grossMarginPercent}%</div>
          <div className="text-[10px] text-slate-500 mt-1">Net profit after AI compute</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="text-xs text-slate-400 font-medium">Total Tokens Consumed</div>
          <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
            {((inputTokens + outputTokens) / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-500 mt-1">{inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out</div>
        </div>
      </div>

      {/* Answer Unit Economics Highlight Banner */}
      <div className="bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-wider text-indigo-300 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> AI Unit Economics Insight
          </div>
          <p className="text-sm text-slate-200 font-semibold">
            Customer subscriptions generate <span className="text-emerald-400 font-bold font-mono">₹{totalRevenue.toLocaleString()}</span> revenue against <span className="text-rose-400 font-bold font-mono">${totalProviderCost.toFixed(2)}</span> of AI infrastructure compute.
          </p>
        </div>
        <div className="px-4 py-2 bg-indigo-600/30 border border-indigo-400/30 text-indigo-200 rounded-xl font-mono text-xs font-bold shrink-0">
          Margin: {grossMarginPercent}%
        </div>
      </div>

      {/* Model Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-200 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-400" /> AI Model Utilization & Provider Cost Breakdown
        </div>
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
            <tr>
              <th className="p-4">AI Model</th>
              <th className="p-4">Total Requests</th>
              <th className="p-4">Estimated Cost ($)</th>
              <th className="p-4">Margin %</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {modelBreakdown.map((m: any) => (
              <tr key={m.model} className="hover:bg-slate-800/40 transition">
                <td className="p-4 font-mono font-bold text-indigo-300">{m.model}</td>
                <td className="p-4 font-mono text-slate-100">{m.requests.toLocaleString()}</td>
                <td className="p-4 font-mono text-rose-400 font-bold">${Number(m.cost).toFixed(2)}</td>
                <td className="p-4 font-mono font-bold text-emerald-400">{m.margin}</td>
                <td className="p-4 text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    HEALTHY
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
