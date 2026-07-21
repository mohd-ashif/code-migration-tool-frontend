import React from 'react';
import { Key, Plus, Check, Copy, Cpu, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../components/common/Button';

interface ApiKeysTabProps {
  newApiKeyName: string;
  setNewApiKeyName: (val: string) => void;
  newApiKeyDays: string;
  setNewApiKeyDays: (val: string) => void;
  generatedKey: { rawKey: string; key: any } | null;
  setGeneratedKey: (val: any) => void;
  copiedKey: boolean;
  apiKeys: any[];
  handleCreateApiKey: (e: React.FormEvent) => void;
  handleRevokeApiKey: (keyId: string) => void;
  copyToClipboard: (text: string) => void;
}

export default function ApiKeysTab({
  newApiKeyName,
  setNewApiKeyName,
  newApiKeyDays,
  setNewApiKeyDays,
  generatedKey,
  setGeneratedKey,
  copiedKey,
  apiKeys,
  handleCreateApiKey,
  handleRevokeApiKey,
  copyToClipboard,
}: ApiKeysTabProps) {
  return (
    <div className="space-y-6 select-none font-sans">
      {/* API Key Creation Form */}
      <form onSubmit={handleCreateApiKey} className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-3 mb-1">
          <Key className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Generate User API Token</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Key Description Name</label>
            <input
              type="text"
              required
              value={newApiKeyName}
              onChange={(e) => setNewApiKeyName(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
              placeholder="e.g., CLI Deployment Token"
            />
          </div>

          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Expires In</label>
            <select
              value={newApiKeyDays}
              onChange={(e) => setNewApiKeyDays(e.target.value)}
              className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-medium"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="90">90 Days</option>
              <option value="never">Never (Permanent)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <Button type="submit" className="w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              Generate Key
            </Button>
          </div>
        </div>
      </form>

      {/* Newly Generated API Key Notification */}
      <AnimatePresence>
        {generatedKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-[#0A1612] border border-[#10B981]/25 text-emerald-400 rounded-xl space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">Secret Key Generated Successfully</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              Copy this key now. For security purposes, it will never be displayed again.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedKey.rawKey}
                className="w-full bg-[#040A07] border border-[#10B981]/15 text-emerald-300 text-xs font-mono px-4 py-3.5 rounded-xl select-all outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(generatedKey.rawKey)}
                className="p-3.5 bg-[#0B0B12] hover:bg-[#1E1F35] border border-white/5 rounded-xl text-zinc-400 hover:text-white transition-all shrink-0 cursor-pointer"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setGeneratedKey(null)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold hover:underline"
              >
                I have copied the key, close this panel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List of Programmatic Keys */}
      <div className="space-y-4 pt-2">
        <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Active API Access Tokens</span>
        {apiKeys.length === 0 ? (
          <div className="p-8 text-center bg-[#0B0B12]/40 border border-[#1E1F35] rounded-xl text-zinc-500 text-xs font-medium">
            No active API keys generated.
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex justify-between items-center p-4 bg-[#0B0B12]/80 border border-[#1E1F35] rounded-xl hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-zinc-800/40 border border-zinc-700/20 text-[#7C6CFF] rounded-lg">
                    <Cpu className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-xs">{key.name}</h4>
                    <div className="flex items-center gap-3 flex-wrap mt-2 font-mono text-[9px] text-zinc-500">
                      <span>Prefix: <strong className="text-zinc-300 font-bold">{key.prefix}••••</strong></span>
                      <span>Created: {new Date(key.createdAt).toLocaleDateString()}</span>
                      <span>Expires: {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</span>
                      <span>Last Used: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevokeApiKey(key.id)}
                  className="p-1.5 rounded-lg border border-[#1E1F35] hover:border-rose-500/20 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer"
                  title="Revoke key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
