import { Smartphone } from 'lucide-react';

export const PortraitLock = () => {
  return (
    <div className='hidden landscape:flex fixed inset-0 z-[99999] bg-brand-navy flex-col items-center justify-center text-white p-6 text-center'>
      <Smartphone
        size={64}
        strokeWidth={1.5}
        className='mb-6 animate-pulse'
        style={{ transform: 'rotate(90deg)' }}
      />
      <h2 className='text-2xl font-black uppercase tracking-wide mb-2'>
        Please Rotate Your Device
      </h2>
      <p className='text-white/70 font-medium max-w-sm'>
        Matchdule is designed to be viewed in portrait mode to give you the best
        scheduling experience.
      </p>
    </div>
  );
};
