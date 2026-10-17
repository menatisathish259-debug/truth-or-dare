import React, { useState } from 'react';
import { getSupabaseConfigStatus } from '../lib/supabase';
import { Database, CheckCircle, AlertCircle, Copy, Check, ExternalLink, X, Terminal } from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const status = getSupabaseConfigStatus();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co\nVITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`;

  const copyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#11092a] border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20 bg-purple-950/40">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-lg">Backend & Database Status</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          {/* Status Chip */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 ${
              status.isConfigured
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                : 'bg-purple-950/30 border-purple-500/30 text-purple-200'
            }`}
          >
            {status.isConfigured ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-white">
                {status.isConfigured
                  ? 'Connected to Supabase PostgreSQL!'
                  : 'Zero-Config Real-Time Mode Active'}
              </p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {status.isConfigured
                  ? 'Your app is directly reading and writing to your live Supabase cloud database with real-time websocket subscriptions.'
                  : 'The game is currently operating in high-performance local multi-tab broadcast mode. You can test multiplayer across multiple tabs/windows immediately without any setup!'}
              </p>
            </div>
          </div>

          {/* Quick instructions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-pink-400" /> Connect Supabase In 2 Steps:
            </h4>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-white/5">
              <li>
                Create a free project on{' '}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-pink-400 underline font-semibold inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                Open the <strong>SQL Editor</strong> in Supabase and paste the contents of{' '}
                <code className="text-pink-300 bg-white/5 px-1 rounded">supabase/schema.sql</code>
              </li>
              <li>Add your Project URL and Anon API key to your <code className="text-pink-300 bg-white/5 px-1 rounded">.env</code> file:</li>
            </ol>
          </div>

          {/* Environment snippet */}
          <div className="relative">
            <pre className="bg-slate-950 border border-purple-500/30 rounded-xl p-3 text-[11px] font-mono text-cyan-300 overflow-x-auto">
              {envSample}
            </pre>
            <button
              type="button"
              onClick={copyEnv}
              className="absolute top-2 right-2 p-1.5 bg-purple-900/60 hover:bg-purple-800 rounded-lg text-slate-300 hover:text-white transition-colors"
              title="Copy snippet"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-purple-950/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-colors shadow"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};
