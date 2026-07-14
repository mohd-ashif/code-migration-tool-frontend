import { useState } from 'react';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import PageHeader from '../../../shared/components/PageHeader';
import { Key, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';

export default function ApiKeys() {
  const [keys] = useState({
    openai: 'sk-proj-••••••••••••••••••••••••3A2B',
    supabase: 'https://••••••••••••••••.supabase.co',
    db: 'postgresql://••••:••••@localhost:5432/migrationdb',
  });

  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const toggleVisibility = (key: string) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields = [
    { id: 'openai', label: 'OpenAI API Key', value: keys.openai, placeholder: 'sk-proj-...' },
    { id: 'supabase', label: 'Supabase URL', value: keys.supabase, placeholder: 'https://...' },
    { id: 'db', label: 'Database URL Connection String', value: keys.db, placeholder: 'postgresql://...' },
  ];

  return (
    <div className="space-y-6 select-none animate-fadeIn max-w-3xl">
      <PageHeader
        title="Environment Settings"
        subtitle="Manage secret keys, connections, and backend authentication integrations"
      />

      <Card className="space-y-6">
        <div className="flex items-center gap-2 border-b border-[#1E1F35] pb-4">
          <Key className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Secret API Keys</h2>
        </div>

        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
                {field.label}
              </label>
              <div className="relative flex items-center">
                <input
                  type={visible[field.id] ? 'text' : 'password'}
                  defaultValue={field.value}
                  placeholder={field.placeholder}
                  className="w-full pl-4 pr-12 py-3 bg-[#0B0B12] border border-[#1E1F35] text-white rounded-xl focus:outline-none focus:border-primary text-xs font-mono select-all"
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.id)}
                  className="absolute right-3 text-gray-500 hover:text-white transition-colors"
                >
                  {visible[field.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center border-t border-[#1E1F35] pt-5">
          <div className="text-[10px] text-gray-500 leading-relaxed font-mono max-w-[400px]">
            * Secrets are loaded securely inside the backend microservice `.env` configuration runtime layer and never cached on the client.
          </div>
          <Button
            onClick={handleSave}
            icon={saved ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Save className="w-4 h-4" />}
            className="shrink-0"
          >
            {saved ? 'Settings Saved' : 'Save Config'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
