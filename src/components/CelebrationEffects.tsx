import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

export const CelebrationEffects: React.FC = () => {
  const { reactions } = useGame();

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: '90vh', scale: 0.5, x: `${reaction.x}vw` }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: '-10vh',
              scale: [0.5, 1.4, 1.2, 0.9],
              rotate: [0, -10, 10, -5, 0],
            }}
            transition={{
              duration: 3.2,
              ease: 'easeOut',
            }}
            className="absolute flex flex-col items-center"
          >
            <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {reaction.emoji}
            </span>
            <span className="text-[11px] font-semibold bg-black/60 px-2 py-0.5 rounded-full text-pink-300 backdrop-blur-sm border border-pink-500/30">
              {reaction.senderName}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
