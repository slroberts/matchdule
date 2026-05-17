'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export const AnimatedSplash = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className='fixed inset-0 flex flex-col items-center justify-center bg-[#0a0e27]'
          style={{ zIndex: 999999, backgroundColor: '#0a0e27' }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, scale: [1, 1.5, 1] }}
            transition={{
              opacity: { duration: 0, ease: 'easeOut' },

              scale: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
            }}
          >
            <Image
              src='/matchdule-symbol.svg'
              alt='Matchdule Logo'
              width={125}
              height={125}
              priority
              className='h-auto w-auto'
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
