import React, { useState } from 'react';
import { useAdminAnalytics } from '../hooks/useAdmin';
import { TrendingUp, PieChart } from 'lucide-react';
import { Skeleton } from '../../../components/common/Skeleton';

export const AdminAnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useAdminAnalytics(days);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <Skeleton className="h-64 bg-slate-900 border border-slate-800" />
      </div>
    );
  }

  const { userGrowth = [], frameworkUsage = [] } = data || {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Platform Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Server-side aggregated platform growth, framework translation popularity, and job throughput.</p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                days === d ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">User Signup Trajectory</h2>
          </div>
          <div className="space-y-2">
            {userGrowth.map((g: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-950/60 rounded border border-slate-800/40">
                <span className="text-slate-400">{new Date(g.date).toLocaleDateString()}</span>
                <span className="font-bold text-indigo-300">+{g.count} new users</span>
              </div>
            ))}
          </div>
        </div>

        {/* Framework Usage Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">Target Framework Distribution</h2>
          </div>
          <div className="space-y-2">
            {frameworkUsage.map((f: any, i: number) => (
              <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-950/60 rounded border border-slate-800/40">
                <span className="font-semibold text-slate-200 uppercase">{f.framework || 'React'}</span>
                <span className="font-bold text-purple-300">{f.count} migrations</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
