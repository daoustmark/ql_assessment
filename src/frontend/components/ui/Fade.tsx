import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface FadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

export function Fade({ children, className, delay = 0, duration = 0.3 }: FadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
} 