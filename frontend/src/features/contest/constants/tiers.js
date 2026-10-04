export const TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    title: 'Novice',
    min: 0,
    max: 1199,
    color: '#f59e0b',
    gradient: 'from-amber-600/90 to-amber-800/90',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    badge: 'Shield',
    glow: 'shadow-amber-500/20'
  },
  {
    id: 'silver',
    name: 'Silver',
    title: 'Specialist',
    min: 1200,
    max: 1499,
    color: '#94a3b8',
    gradient: 'from-slate-400/90 to-slate-600/90',
    border: 'border-slate-400/40',
    bg: 'bg-slate-400/10',
    text: 'text-slate-300',
    badge: 'Swords',
    glow: 'shadow-slate-400/20'
  },
  {
    id: 'gold',
    name: 'Gold',
    title: 'Expert',
    min: 1500,
    max: 1799,
    color: '#eab308',
    gradient: 'from-yellow-400/90 to-amber-500/90',
    border: 'border-yellow-500/40',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    badge: 'Crown',
    glow: 'shadow-yellow-500/25'
  },
  {
    id: 'platinum',
    name: 'Platinum',
    title: 'Master',
    min: 1800,
    max: 2099,
    color: '#06b6d4',
    gradient: 'from-cyan-400/90 to-blue-600/90',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    badge: 'Gem',
    glow: 'shadow-cyan-500/25'
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    title: 'Guardian',
    min: 2100,
    max: 3000,
    color: '#ec4899',
    gradient: 'from-purple-500/90 to-pink-500/90',
    border: 'border-pink-500/40',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    badge: 'Flame',
    glow: 'shadow-pink-500/30'
  }
];

export const getTier = (rating) => {
  const r = Math.max(0, Number(rating) || 0);
  const tier = TIERS.find(t => r >= t.min && r <= t.max) || TIERS[TIERS.length - 1];
  const span = Math.max(1, tier.max - tier.min);
  const progressPercent = Math.min(100, Math.max(0, Math.round(((r - tier.min) / span) * 100)));
  const pointsToNext = Math.max(0, tier.max + 1 - r);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1] || null;

  return {
    ...tier,
    progressPercent,
    pointsToNext,
    nextTier
  };
};
