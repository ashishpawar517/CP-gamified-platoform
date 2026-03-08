'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAchievement } from '@/lib/gamification';

interface CelebrationProps {
  type: 'xp' | 'levelUp' | 'achievement' | 'streak' | 'goal';
  data?: {
    amount?: number;
    level?: number;
    achievementId?: string;
    streakDays?: number;
  };
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  velocity: { x: number; y: number };
}

export function CelebrationEffects({ type, data, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Generate particles
    const newParticles: Particle[] = [];
    const colors = ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6', '#ef4444'];
    
    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        velocity: {
          x: (Math.random() - 0.5) * 20,
          y: -Math.random() * 15 - 10,
        },
      });
    }
    setParticles(newParticles);

    // Auto dismiss
    const timer = setTimeout(() => {
      setShowContent(false);
      setTimeout(onComplete, 500);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const achievement = data?.achievementId ? getAchievement(data.achievementId) : null;

  return (
    <AnimatePresence>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Particle effects */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                x: particle.x,
                y: particle.y,
                opacity: 1,
              }}
              animate={{
                y: particle.y + particle.velocity.y * 20,
                x: particle.x + particle.velocity.x * 20,
                opacity: 0,
                rotate: Math.random() * 360,
              }}
              transition={{ duration: 2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                width: particle.size,
                height: particle.size,
                borderRadius: '50%',
                backgroundColor: particle.color,
              }}
            />
          ))}

          {/* Main content */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative"
          >
            {type === 'xp' && (
              <div className="px-8 py-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl shadow-orange-500/50">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-2">✨</div>
                  <div className="text-4xl font-bold">+{data?.amount} XP</div>
                  <div className="text-lg opacity-90 mt-1">Great job!</div>
                </motion.div>
              </div>
            )}

            {type === 'levelUp' && (
              <div className="px-10 py-8 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-2xl shadow-purple-500/50">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="text-6xl mb-3"
                  >
                    🎉
                  </motion.div>
                  <div className="text-2xl font-bold mb-2">LEVEL UP!</div>
                  <div className="text-6xl font-bold mb-2">{data?.level}</div>
                  <div className="text-lg opacity-90">You&apos;re getting stronger!</div>
                </motion.div>
              </div>
            )}

            {type === 'achievement' && achievement && (
              <div className="px-10 py-8 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-2xl shadow-yellow-500/50">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-6xl mb-3"
                  >
                    {achievement.icon}
                  </motion.div>
                  <div className="text-xl font-bold mb-1">Achievement Unlocked!</div>
                  <div className="text-3xl font-bold">{achievement.name}</div>
                  <div className="text-sm opacity-90 mt-2">{achievement.description}</div>
                </motion.div>
              </div>
            )}

            {type === 'streak' && (
              <div className="px-10 py-8 rounded-2xl bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-2xl shadow-red-500/50">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="text-6xl mb-3"
                  >
                    🔥
                  </motion.div>
                  <div className="text-xl font-bold mb-1">Streak Extended!</div>
                  <div className="text-5xl font-bold">{data?.streakDays} days</div>
                  <div className="text-sm opacity-90 mt-2">Keep the momentum going!</div>
                </motion.div>
              </div>
            )}

            {type === 'goal' && (
              <div className="px-10 py-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-2xl shadow-green-500/50">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 1 }}
                    className="text-6xl mb-3"
                  >
                    🎯
                  </motion.div>
                  <div className="text-2xl font-bold mb-1">Daily Goal Complete!</div>
                  <div className="text-lg opacity-90">Amazing work today!</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Confetti button effect
export function ConfettiButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      color: ['#f59e0b', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'][Math.floor(Math.random() * 5)],
    }));
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1000);
    onClick?.();
  };

  return (
    <>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
          animate={{
            x: particle.x + (Math.random() - 0.5) * 200,
            y: particle.y + (Math.random() - 0.5) * 200 - 100,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: particle.color,
            pointerEvents: 'none',
            zIndex: 9999,
          }}
        />
      ))}
      <button onClick={handleClick}>{children}</button>
    </>
  );
}
