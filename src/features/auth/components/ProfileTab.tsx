import { User, Globe } from 'lucide-react';
import Button from '../../../components/common/Button';

const avatarPresets = [
  'linear-gradient(135deg, #7C6CFF 0%, #A68CFF 100%)',
  'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #10B981 0%, #14B8A6 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #64748B 0%, #475569 100%)'
];

interface ProfileTabProps {
  fullName: string;
  setFullName: (val: string) => void;
  company: string;
  setCompany: (val: string) => void;
  bio: string;
  setBio: (val: string) => void;
  avatarUrl: string;
  setAvatarUrl: (val: string) => void;
  currentUser: any;
  loading: boolean;
  handleUpdateProfile: (e: React.FormEvent) => void;
}

export default function ProfileTab({
  fullName,
  setFullName,
  company,
  setCompany,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  currentUser,
  loading,
  handleUpdateProfile
}: ProfileTabProps) {
  return (
    <form onSubmit={handleUpdateProfile} className="space-y-6 select-none">
      <div className="flex flex-col md:flex-row items-center gap-6 pb-2">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-glow border border-white/5 relative group overflow-hidden"
          style={{ background: avatarUrl.startsWith('linear-gradient') ? avatarUrl : '#7C6CFF' }}
        >
          {avatarUrl.startsWith('http') ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            currentUser?.fullName?.charAt(0).toUpperCase() || currentUser?.email.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div className="flex-1 space-y-3">
          <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Select Avatar Style Preset</span>
          <div className="flex flex-wrap gap-2.5">
            {avatarPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setAvatarUrl(preset)}
                className={`w-7 h-7 rounded-lg border transition-all ${avatarUrl === preset ? 'border-primary scale-110 shadow-glow-sm' : 'border-transparent hover:scale-105'}`}
                style={{ background: preset }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Full Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Company / Organization</label>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary"
              placeholder="Acme Corp"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Bio / Description</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary resize-none"
          placeholder="Software architect interested in AST compiling..."
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">Custom Avatar Image URL</label>
        <input
          type="text"
          value={avatarUrl.startsWith('http') ? avatarUrl : ''}
          onChange={(e) => setAvatarUrl(e.target.value)}
          className="w-full px-4 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white text-xs rounded-xl focus:outline-none focus:border-primary font-mono"
          placeholder="https://example.com/avatar.jpg"
        />
      </div>

      <div className="border-t border-[#1E1F35] pt-5 flex justify-end">
        <Button type="submit" loading={loading} className="px-6 py-2.5 text-xs font-semibold rounded-xl">
          Save Changes
        </Button>
      </div>
    </form>
  );
}
