import React, {
  useRef,
  useEffect,
  useCallback,
  type ReactElement,
} from 'react';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
// import CustomButton from './bButton';
import { cn } from '../../../utils/utils';
import type { KatanaWindow } from '../../../stores/windowStore';
import { getWindowEffectiveTheme } from '../../../stores/windowStore';
import { adjustHex } from '../../../utils/ui-helper-functions';
import { useWindowStore } from '../../../stores/windowStore';
import BladeButton from './BladeButton';

interface KatanaWindowProps {
  bWindow: KatanaWindow;
  children: ReactElement;
}

const BladeWindow = ({ bWindow, children }: KatanaWindowProps) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const resizeDir = useRef('');
  const lastCoords = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_WIDTH = 300;
  const MIN_HEIGHT = 300;

  // Get store actions
  const moveWindow = useWindowStore((s) => s.moveWindow);
  const updateWindow = useWindowStore((s) => s.updateWindow);
  const bringToFrontStore = useWindowStore((s) => s.bringToFront);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();

      const target = e.currentTarget as HTMLElement;

      if (!target.hasAttribute('data-draggable')) return;

      const eventTarget = (e as any).target as HTMLElement;
      if (
        ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'LABEL'].includes(
          eventTarget.tagName
        ) ||
        eventTarget.closest('[data-nodrag]')
      ) {
        return;
      }

      (e as any).preventDefault();
      isDragging.current = true;
      const clientX = (e as React.TouchEvent).touches
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.MouseEvent).clientX;
      const clientY = (e as React.TouchEvent).touches
        ? (e as React.TouchEvent).touches[0].clientY
        : (e as React.MouseEvent).clientY;
      lastCoords.current = { x: clientX, y: clientY };
    },
    []
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent, direction: string) => {
      e.stopPropagation();
      (e as any).preventDefault();

      isResizing.current = true;
      resizeDir.current = direction;

      const clientX = (e as React.TouchEvent).touches
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.MouseEvent).clientX;
      const clientY = (e as React.TouchEvent).touches
        ? (e as React.TouchEvent).touches[0].clientY
        : (e as React.MouseEvent).clientY;

      lastCoords.current = { x: clientX, y: clientY };
    },
    []
  );

  const handleDragMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current && !isResizing.current) return;
      (e as any).preventDefault();

      const clientX = (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0].clientX
        : (e as MouseEvent).clientX;
      const clientY = (e as TouchEvent).touches
        ? (e as TouchEvent).touches[0].clientY
        : (e as MouseEvent).clientY;

      const deltaX = clientX - lastCoords.current.x;
      const deltaY = clientY - lastCoords.current.y;
      lastCoords.current = { x: clientX, y: clientY };

      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        if (isDragging.current) {
          moveWindow(bWindow.id, {
            x: bWindow.position.x + deltaX,
            y: bWindow.position.y + deltaY,
          });
        }

        if (isResizing.current) {
          const direction = resizeDir.current;
          const prev = bWindow.size;
          const prevPos = bWindow.position;

          let newWidth = prev.width;
          let newHeight = prev.height;
          let positionDelta = { x: 0, y: 0 };

          if (direction.includes('right')) {
            newWidth = Math.max(MIN_WIDTH, prev.width + deltaX);
          }
          if (direction.includes('left')) {
            newWidth = Math.max(MIN_WIDTH, prev.width - deltaX);
            positionDelta.x = prev.width - newWidth;
          }
          if (direction.includes('bottom')) {
            newHeight = Math.max(MIN_HEIGHT, prev.height + deltaY);
          }
          if (direction.includes('top')) {
            newHeight = Math.max(MIN_HEIGHT, prev.height - deltaY);
            positionDelta.y = prev.height - newHeight;
          }

          const updatePayload: any = {
            size: { width: newWidth, height: newHeight },
          };

          if (positionDelta.x !== 0 || positionDelta.y !== 0) {
            updatePayload.position = {
              x: prevPos.x + positionDelta.x,
              y: prevPos.y + positionDelta.y,
            };
          }

          updateWindow(bWindow.id, updatePayload);
        }
      });
    },
    [bWindow, moveWindow, updateWindow]
  );

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    isResizing.current = false;
    resizeDir.current = '';
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  useEffect(() => {
    const moveHandler = (e: MouseEvent | TouchEvent) => handleDragMove(e);
    const endHandler = () => handleDragEnd();

    window.addEventListener('mousemove', moveHandler as EventListener);
    window.addEventListener('mouseup', endHandler);
    window.addEventListener('touchmove', moveHandler as EventListener, {
      passive: false,
    });
    window.addEventListener('touchend', endHandler);

    return () => {
      window.removeEventListener('mousemove', moveHandler as EventListener);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchmove', moveHandler as EventListener);
      window.removeEventListener('touchend', endHandler);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [handleDragMove, handleDragEnd]);

  // Get effective theme (uses window-specific or falls back to global theme)
  const effectiveTheme = getWindowEffectiveTheme(bWindow);

  // Derive RGBA color from effective theme
  const rgbaUiColor = `${effectiveTheme.uiColor}${Math.round(
    effectiveTheme.opacity * 255
  )
    .toString(16)
    .padStart(2, '0')}`;

  // Derive isOpen state from store
  const isOpen = !bWindow.isMinimized;

  const cornersStyle = 'w-2 h-2 z-50';
  const hBordersStyle = 'z-10 w-full h-1';
  const vBordersStyle = 'z-10 w-1 h-full';

  const resizeHandles = [
    {
      dir: 'top-left',
      style: `${cornersStyle} top-0 left-0 cursor-nwse-resize`,
    },
    {
      dir: 'top',
      style: `${hBordersStyle} top-0 left-1/2 -translate-x-1/2 cursor-ns-resize`,
    },
    {
      dir: 'top-right',
      style: `${cornersStyle} top-0 right-0 cursor-nesw-resize`,
    },
    {
      dir: 'right',
      style: `${vBordersStyle} top-1/2 right-0 -translate-y-1/2 cursor-ew-resize`,
    },
    {
      dir: 'bottom-right',
      style: `${cornersStyle} bottom-0 right-0 cursor-nwse-resize`,
    },
    {
      dir: 'bottom',
      style: `${hBordersStyle} bottom-0 left-1/2 -translate-x-1/2 cursor-ns-resize`,
    },
    {
      dir: 'bottom-left',
      style: `${cornersStyle} bottom-0 left-0 cursor-nesw-resize`,
    },
    {
      dir: 'left',
      style: `${vBordersStyle} top-1/2 left-0 -translate-y-1/2 cursor-ew-resize`,
    },
  ];

  const handleToggleMinimize = () => {
    updateWindow(bWindow.id, {
      isMinimized: !bWindow.isMinimized,
    });
  };

  const handleBringToFront = () => {
    bringToFrontStore(bWindow.id);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        // left: 0,
        // top: 0,
        transform: `translate(${bWindow.position.x}px, ${bWindow.position.y}px)`,
        userSelect: 'none',
        width: isOpen ? `${bWindow.size.width}px` : 'fit-content',
        height: isOpen ? `${bWindow.size.height}px` : 'fit-content',
        zIndex: bWindow.zIndex,
      }}
      onMouseDown={(e) => {
        handleDragStart(e);
        handleBringToFront();
      }}
      onTouchStart={(e) => {
        handleDragStart(e);
        handleBringToFront();
      }}
      onClick={(e) => e.stopPropagation()}
      data-draggable
      className={cn(isOpen ? 'min-w-112.5 overflow-clip' : '')}
    >
      {/* Resize handles - only visible when open */}
      {isOpen &&
        resizeHandles.map(({ dir, style }) => (
          <div
            key={dir}
            className={`absolute ${style}`}
            onMouseDown={(e) => handleResizeStart(e, dir)}
            onTouchStart={(e) => handleResizeStart(e, dir)}
          />
        ))}

      <div
        className={`flex p-1 rounded-lg shadow-xl bg- max-h-screen cursor-move h-full`}
        style={{
          backgroundColor: rgbaUiColor,
          borderWidth: '1px',
          borderColor: adjustHex(effectiveTheme.uiColor, 0.2),
          backdropFilter: `blur(${effectiveTheme.blur}px)`,
          WebkitBackdropFilter: `blur(${effectiveTheme.blur}px)`,
        }}
      >
        <div className='p-1 flex flex-col flex-1'>
          <div
            className={` bg-amber-50/0 w-full flex gap-2 justify-center items-center ${
              !isOpen ? 'flex-co border-b-0' : 'pb-4 border-b'
            }`}
            style={{
              borderColor: '#000000',
            }}
          >
            <div className='w-full flex justify-center items-center cursor-pointer'>
              {isOpen ? (
                <h2 className='lg:text-2xl text-white inline-block transition-all duration-300 ease-in-out hover:[text-shadow:0_0_20px_rgba(255,255,255,0.9)]'>
                  {bWindow.title}
                </h2>
              ) : (
                <span className='mb-2 relative text-white inline-block transition-all duration-300 ease-in-out hover:[text-shadow:0_0_5px_rgba(255,255,255,1.0)]'>
                  {'Open menu -->'}
                </span>
              )}
            </div>

            <BladeButton
              color={effectiveTheme.primaryColor}
              onClick={handleToggleMinimize}
            >
              {isOpen ? (
                <HiX className='text-xl' />
              ) : (
                <HiMenuAlt3 className='text-xl' />
              )}
            </BladeButton>
          </div>

          {isOpen && (
            <div
              className='max-_h-[600px] overflow-y-auto custom-scrollbar flex-1'
              style={
                {
                  '--scroll-color': effectiveTheme.uiColor,
                } as React.CSSProperties
              }
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BladeWindow;
