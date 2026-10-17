import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { QuestionType, QuestionCategory, Difficulty } from '../types/game';
import { PlusCircle, Trash2, X, Sparkles, AlertTriangle, Check } from 'lucide-react';

interface CustomQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomQuestionsModal: React.FC<CustomQuestionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { customQuestions, addCustomQuestion, deleteCustomQuestion, reportQuestion } = useGame();

  const [text, setText] = useState('');
  const [type, setType] = useState<QuestionType>('truth');
  const [category, setCategory] = useState<QuestionCategory>('funny');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmed = text.trim();
    if (trimmed.length < 5) {
      setError('Question or dare must be at least 5 characters long.');
      return;
    }

    addCustomQuestion({
      text: trimmed,
      type,
      category,
      difficulty,
    });

    setText('');
    setSuccess('Custom prompt successfully added to the game pool!');
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#11092a] border border-purple-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-purple-500/20 bg-purple-950/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-white text-lg">Custom Question Library</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Add form */}
          <form onSubmit={handleAdd} className="glass-panel p-4 rounded-2xl border border-purple-500/20 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-pink-400" /> Create Custom Truth or Dare
            </h4>

            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            {success && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> {success}
              </p>
            )}

            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your custom question or dare prompt here..."
                rows={2}
                className="w-full bg-slate-900/80 border border-purple-500/30 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Type */}
              <div>
                <label className="block text-[11px] font-semibold text-purple-300 mb-1">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as QuestionType)}
                  className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="truth">Truth</option>
                  <option value="dare">Dare</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-purple-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                  className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white capitalize"
                >
                  <option value="funny">Funny</option>
                  <option value="friendship">Friendship</option>
                  <option value="crushes">Crushes</option>
                  <option value="personal">Personal</option>
                  <option value="embarrassing">Embarrassing</option>
                  <option value="funny_actions">Funny Actions</option>
                  <option value="acting">Acting</option>
                  <option value="creative">Creative</option>
                  <option value="video_call">Video Call</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[11px] font-semibold text-purple-300 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-900 border border-purple-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white capitalize"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="spicy">🔥 Spicy</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl text-xs shadow hover:opacity-95 transition-opacity"
            >
              Add To Game Pool
            </button>
          </form>

          {/* List of custom questions */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
              Your Custom Prompts ({customQuestions.length})
            </h4>

            {customQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 glass-panel rounded-xl">
                No custom questions added yet. Add one above!
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs"
                  >
                    <div className="flex-1 pr-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            q.type === 'truth' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-pink-500/20 text-pink-300'
                          }`}
                        >
                          {q.type}
                        </span>
                        <span className="text-slate-400 capitalize">{q.category}</span>
                        <span className="text-slate-500">• {q.difficulty}</span>
                      </div>
                      <p className="text-white">{q.text}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => deleteCustomQuestion(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-purple-500/20 bg-purple-950/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
