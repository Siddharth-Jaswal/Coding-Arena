import React, { useEffect, useState } from 'react';
import { Timer } from 'lucide-react';

export const ContestTimer = ({ endsAt }) => {
  const [remainingTime, setRemainingTime] = useState('');

  useEffect(() => {
    if (!endsAt) {
      setRemainingTime('--:--');
      return;
    }

    const calculateRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setRemainingTime('00:00');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      const parts = [];
      if (hours > 0) parts.push(hours.toString().padStart(2, '0'));
      parts.push(minutes.toString().padStart(2, '0'));
      parts.push(seconds.toString().padStart(2, '0'));

      setRemainingTime(parts.join(':'));
    };

    calculateRemaining(); // Initial call
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <div className="flex items-center gap-2 font-mono text-lg font-semibold text-primary">
      <Timer size={20} />
      <span>{remainingTime}</span>
    </div>
  );
};
