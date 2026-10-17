export interface AvatarData {
  id: string;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  glowColor: string;
}

export const AVATARS: AvatarData[] = [
  {
    id: 'cyber-fox',
    name: 'Cyber Fox',
    emoji: '🦊',
    bgGradient: 'from-orange-500 to-amber-600',
    borderColor: 'border-orange-400',
    glowColor: 'rgba(251, 146, 60, 0.5)',
  },
  {
    id: 'cosmic-cat',
    name: 'Cosmic Cat',
    emoji: '🐱',
    bgGradient: 'from-purple-600 to-indigo-700',
    borderColor: 'border-purple-400',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    id: 'neon-skull',
    name: 'Neon Skull',
    emoji: '💀',
    bgGradient: 'from-pink-600 to-rose-700',
    borderColor: 'border-pink-400',
    glowColor: 'rgba(244, 63, 94, 0.5)',
  },
  {
    id: 'party-panda',
    name: 'Party Panda',
    emoji: '🐼',
    bgGradient: 'from-emerald-500 to-teal-700',
    borderColor: 'border-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    id: 'gamer-alien',
    name: 'Gamer Alien',
    emoji: '👽',
    bgGradient: 'from-lime-500 to-green-700',
    borderColor: 'border-lime-400',
    glowColor: 'rgba(132, 204, 22, 0.5)',
  },
  {
    id: 'fire-dragon',
    name: 'Fire Dragon',
    emoji: '🐉',
    bgGradient: 'from-red-600 to-amber-600',
    borderColor: 'border-red-400',
    glowColor: 'rgba(239, 68, 68, 0.5)',
  },
  {
    id: 'cool-bear',
    name: 'Cool Bear',
    emoji: '🐻',
    bgGradient: 'from-amber-700 to-stone-800',
    borderColor: 'border-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.5)',
  },
  {
    id: 'disco-star',
    name: 'Disco Star',
    emoji: '⭐',
    bgGradient: 'from-yellow-400 to-pink-500',
    borderColor: 'border-yellow-300',
    glowColor: 'rgba(250, 204, 21, 0.5)',
  },
  {
    id: 'dj-sloth',
    name: 'DJ Sloth',
    emoji: '🦥',
    bgGradient: 'from-cyan-600 to-blue-800',
    borderColor: 'border-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.5)',
  },
  {
    id: 'astro-bunny',
    name: 'Astro Bunny',
    emoji: '🐰',
    bgGradient: 'from-fuchsia-500 to-purple-800',
    borderColor: 'border-fuchsia-400',
    glowColor: 'rgba(217, 70, 239, 0.5)',
  },
  {
    id: 'pixel-ghost',
    name: 'Pixel Ghost',
    emoji: '👻',
    bgGradient: 'from-blue-500 to-indigo-900',
    borderColor: 'border-blue-400',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'magic-owl',
    name: 'Magic Owl',
    emoji: '🦉',
    bgGradient: 'from-teal-600 to-slate-800',
    borderColor: 'border-teal-400',
    glowColor: 'rgba(20, 184, 166, 0.5)',
  },
];

export const getAvatarById = (id: string): AvatarData => {
  const found = AVATARS.find((a) => a.id === id);
  return (
    found || {
      id: 'default',
      name: 'Party Star',
      emoji: '✨',
      bgGradient: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-400',
      glowColor: 'rgba(168, 85, 247, 0.5)',
    }
  );
};
