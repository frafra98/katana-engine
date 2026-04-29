import { useRef } from 'react';
import gsap from 'gsap';
import { useLoadingStore } from '../../stores/loadingScreenStore';
import Footer from './footer';

const WelcomeScreen = ({
  isReady,
  onStart,
}: {
  isReady: boolean;
  onStart: () => void;
}) => {
  const progress = useLoadingStore((s) => s.progress);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = () => {
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        y: -80,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.inOut',

        onComplete: () => {
          requestAnimationFrame(() => {
            onStart();
          });
        },
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className='z-999 fixed inset-0 flex  flex-col items-center justify-center bg-(--background) select-none'
    >
      <div className='text-center flex flex-col items-center gap-4'>
        <img src='/katana_engine_logo.png' className='mx-auto max-w-xs' />

        {!isReady ? (
          <>
            <div className='w-64 h-2 bg-gray-800 mx-auto relative rounded-4xl overflow-hidden'>
              <div
                className='h-full bg-green-500 transition-all duration-150 ease-out rounded-4xl'
                style={{
                  width: `${Math.min(progress, 99)}%`,
                }}
              />
            </div>
            <p className='text-green-400 text-sm'>{Math.round(progress)}%</p>
          </>
        ) : (
          <button
            onClick={handleStart}
            className='px-6 py-2 bg-green-500! text-black! font-bold! rounded-xl!'
          >
            Start App
          </button>
        )}
      </div>

      <div className='w-full fixed bottom-0 left-0'>
        <Footer />
      </div>
    </div>
  );
};

export default WelcomeScreen;
