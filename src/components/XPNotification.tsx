'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XPNotification as XPNotificationType } from '@/lib/types';
import { Sparkles } from 'lucide-react';

interface XPNotificationProps {
  notifications: XPNotificationType[];
  onClear: () => void;
}

export function XPNotification({ notifications, onClear }: XPNotificationProps) {
  const [currentNotification, setCurrentNotification] = useState<XPNotificationType | null>(null);

  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
    onClear();
  }, [onClear]);

  useEffect(() => {
    if (notifications.length > 0 && !currentNotification) {
      // Show the most recent notification using a microtask to avoid cascading renders
      const timeoutId = setTimeout(() => {
        setCurrentNotification(notifications[0]);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [notifications, currentNotification]);

  useEffect(() => {
    if (currentNotification) {
      // Auto dismiss after 3 seconds
      const timer = setTimeout(dismissNotification, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentNotification, dismissNotification]);

  return (
    <AnimatePresence>
      {currentNotification && (
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className="fixed top-4 right-4 z-50"
        >
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <div className="flex flex-col">
              <span className="font-bold text-lg">+{currentNotification.amount} XP</span>
              <span className="text-sm opacity-90">{currentNotification.reason}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
