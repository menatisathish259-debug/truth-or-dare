import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useAuth } from '../context/AuthContext';
import { getAvatarById } from '../lib/avatars';
import { MessageSquare, Send, X, Smile, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EMOJI_PRESETS = ['😂', '🔥', '😱', '👏', '💀', '🍿', '💖', '🤐', '🎉', '👀'];

export const ChatDrawer: React.FC = () => {
  const { chatMessages, sendMessage, sendReaction } = useGame();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const prevCountRef = useRef(chatMessages.length);

  useEffect(() => {
    if (!isOpen && chatMessages.length > prevCountRef.current) {
      setUnreadCount((prev) => prev + (chatMessages.length - prevCountRef.current));
    }
    prevCountRef.current = chatMessages.length;

    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="fixed bottom-5 right-5 z-40 bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3.5 rounded-full shadow-lg shadow-pink-500/30 hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border border-pink-400/40"
      >
        <MessageSquare className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0a051b] animate-bounce">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Reactions Bar above chat trigger */}
      <div className="fixed bottom-20 right-5 z-40 hidden sm:flex flex-col gap-1.5 p-1.5 glass-panel rounded-full border border-purple-500/30 shadow-xl">
        {EMOJI_PRESETS.slice(0, 5).map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => sendReaction(emoji)}
            className="w-9 h-9 rounded-full hover:bg-white/10 active:scale-125 transition-transform flex items-center justify-center text-lg hover:scale-110"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full sm:w-96 max-w-full h-full bg-[#11092a] border-l border-purple-500/30 shadow-2xl flex flex-col z-10"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-purple-500/20 bg-purple-950/40">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-pink-400" />
                  <h3 className="font-bold text-white text-base">Party Chat & Emojis</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Emoji quick reaction row */}
              <div className="p-3 bg-purple-900/20 border-b border-purple-500/10">
                <p className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Tap to blast reaction:
                </p>
                <div className="flex items-center justify-between gap-1">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => sendReaction(emoji)}
                      className="text-xl p-1.5 hover:scale-130 active:scale-95 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-4">
                    <Smile className="w-10 h-10 text-purple-400/50 mb-2 animate-bounce" />
                    <p className="text-sm font-medium">No messages yet!</p>
                    <p className="text-xs text-slate-500 mt-1">Break the ice or fire an emoji reaction!</p>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isMe = msg.senderId === user?.id;
                    const avatar = getAvatarById(msg.senderAvatar);
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm bg-gradient-to-br ${avatar.bgGradient} flex-shrink-0 shadow`}
                        >
                          {avatar.emoji}
                        </div>
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-tr-none shadow-md'
                              : 'bg-slate-800/80 text-slate-100 rounded-tl-none border border-white/5'
                          }`}
                        >
                          {!isMe && (
                            <p className="text-[10px] font-bold text-pink-300 mb-0.5">
                              {msg.senderName}
                            </p>
                          )}
                          <p className="break-words leading-relaxed">{msg.text}</p>
                          <span className="block text-[9px] text-white/50 text-right mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSend} className="p-3 border-t border-purple-500/20 bg-purple-950/30 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or dare comment..."
                  className="flex-1 bg-slate-900/80 border border-purple-500/30 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl transition-colors flex items-center justify-center shadow-md shadow-pink-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
