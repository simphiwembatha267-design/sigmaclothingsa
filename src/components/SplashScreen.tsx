import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0, 1, 0, 1],
          }}
          transition={{
            duration: 5.5,
            times: [0, 0.12, 0.28, 0.45, 0.62, 0.82],
            ease: 'easeInOut',
          }}
          onAnimationComplete={onComplete}
        >
          <Logo className="h-20 md:h-28" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
