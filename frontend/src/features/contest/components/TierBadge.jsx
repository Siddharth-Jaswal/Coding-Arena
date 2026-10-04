import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Swords, Crown, Gem, Flame } from 'lucide-react';
import { getTier } from '../constants/tiers';

const ICONS = {
  Bronze: Shield,
  Silver: Swords,
  Gold: Crown,
  Platinum: Gem,
  Grandmaster: Flame
};

export const TierBadge = ({ 
  rating, 
  tier: propTier, 
  size = 'md', 
  showLabel = true, 
  showTitle = false, 
  animated = false,
  className = ''
}) => {
  const tier = propTier || getTier(rating);
  const Icon = ICONS[tier.name] || Shield;

  const sizeClasses = {
    sm: {
      wrapper: 'px-2 py-0.5 text-xs gap-1.5',
      icon: 12,
      badge: 'w-5 h-5'
    },
    md: {
      wrapper: 'px-2.5 py-1 text-xs gap-2',
      icon: 15,
      badge: 'w-7 h-7'
    },
    lg: {
      wrapper: 'px-3.5 py-1.5 text-sm gap-2.5',
      icon: 18,
      badge: 'w-10 h-10'
    },
    xl: {
      wrapper: 'px-4 py-2 text-base gap-3',
      icon: 24,
      badge: 'w-14 h-14'
    }
  }[size] || sizeClasses.md;

  const BadgeContent = (
    <div 
      className={`inline-flex items-center rounded-full font-semibold border backdrop-blur-md ${tier.bg} ${tier.border} ${tier.text} ${tier.glow} shadow-lg ${sizeClasses.wrapper} ${className}`}
    >
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br ${tier.gradient} text-white shadow-inner shrink-0 ${sizeClasses.badge}`}
      >
        <Icon size={sizeClasses.icon} className="drop-shadow-sm" />
      </div>
      {showLabel && (
        <span className="tracking-wide uppercase font-mono font-bold">
          {tier.name}
          {showTitle && tier.title && (
            <span className="text-white/60 font-normal ml-1 text-[0.85em]">
              · {tier.title}
            </span>
          )}
        </span>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {BadgeContent}
      </motion.div>
    );
  }

  return BadgeContent;
};
