import { History, Activity } from 'lucide-react';

interface ActivityHistoryTabProps {
  loginLogs: any[];
  activityLogs: any[];
}

export default function ActivityHistoryTab({
  loginLogs,
  activityLogs,
}: ActivityHistoryTabProps) {
  return (
    <div className="space-y-6 select-none font-mono">
      {/* Login History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <History className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Login History Logs</h3>
        </div>

        <div className="overflow-x-auto bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
          <table className="w-full text-left text-[10px] text-zinc-400 border-collapse">
            <thead>
              <tr className="border-b border-[#1E1F35] text-zinc-500 font-bold uppercase">
                <th className="p-3.5 pl-5">Date/Time</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5">Browser / OS Details</th>
              </tr>
            </thead>
            <tbody>
              {loginLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="border-b border-[#1E1F35]/40 hover:bg-white/5 transition-colors">
                  <td className="p-3.5 pl-5 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-zinc-300">{log.ipAddress}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${log.loginStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      {log.loginStatus}
                    </span>
                  </td>
                  <td className="p-3.5 pr-5 truncate max-w-xs" title={log.userAgent}>{log.userAgent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Audit Security Log</h3>
        </div>

        <div className="overflow-x-auto bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl">
          <table className="w-full text-left text-[10px] text-zinc-400 border-collapse">
            <thead>
              <tr className="border-b border-[#1E1F35] text-zinc-500 font-bold uppercase">
                <th className="p-3.5 pl-5">Date/Time</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5 pr-5">Event Meta Payload</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.slice(0, 8).map((log) => (
                <tr key={log.id} className="border-b border-[#1E1F35]/40 hover:bg-white/5 transition-colors">
                  <td className="p-3.5 pl-5 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-zinc-200">{log.action.replace('_', ' ').toUpperCase()}</td>
                  <td className="p-3.5 pr-5 text-zinc-500 font-mono truncate max-w-xs">{log.metadata ? JSON.stringify(log.metadata) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
