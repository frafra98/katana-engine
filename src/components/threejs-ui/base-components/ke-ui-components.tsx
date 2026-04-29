import React, { useEffect, useRef, useState } from 'react';

interface ColorInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ColorPickerProps {
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Reusable components remain the same
export const KEColorInput: React.FC<ColorInputProps> = React.memo(
  ({ label, id, value, onChange }) => (
    <div className='flex items-center gap-2'>

      <KEColourPicker id={id} value={value} onChange={onChange} />
      <label htmlFor={id}>{label}</label>
    </div>
  )
);

export const KEColourPicker: React.FC<ColorPickerProps> = React.memo(
  ({ value, onChange, id = Math.random().toString() }) => (
    <label
      className='relative inline-block hover:border-white w-10 h-10 rounded-full border-2 border-black cursor-pointer shadow-2xl'
      style={{ backgroundColor: value }}
    >
      <input
        id={id}
        type='color'
        value={value}
        onChange={onChange}
        // className='hidden'
        style={{
          opacity: 0,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'pointer',
        }}
      />
    </label>
  )
);

type KESliderProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  onCustomEvent?: () => void;
  min?: number;
  max?: number;
  step?: number;
  color?: string;
  thumbShape?: 'circle' | 'square' | 'diamond' | 'triangle'; 
};

export const KESlider: React.FC<KESliderProps & { isVertical?: boolean }> = ({
  id = Math.random().toString(),
  value,
  onChange = () => {},
  min = 0,
  max = 1,
  step = 0.01,
  color = '#4f46e5',
  thumbShape = 'circle',
  isVertical = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const clamp = (val: number) => Math.min(Math.max(val, min), max);
  const roundToStep = (val: number) => {
    const stepped = Math.round((val - min) / step) * step + min;
    return parseFloat(stepped.toFixed(10));
  };

  const getPercent = (val: number) => ((val - min) / (max - min)) * 100;

  const getClientCoord = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ) => {
    if ('touches' in e) {
      return isVertical
        ? e.touches[0]?.clientY ?? 0
        : e.touches[0]?.clientX ?? 0;
    } else {
      return isVertical ? e.clientY : e.clientX;
    }
  };

  const updateValueFromEvent = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ) => {
    if (!trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const coord = getClientCoord(e);

    let percent: number;
    if (isVertical) {
      const y = Math.min(Math.max(0, coord - rect.top), rect.height);
      percent = 1 - y / rect.height; // Invert: top = max, bottom = min
    } else {
      const x = Math.min(Math.max(0, coord - rect.left), rect.width);
      percent = x / rect.width;
    }

    const rawValue = percent * (max - min) + min;
    const steppedValue = clamp(roundToStep(rawValue));
    onChange(steppedValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateValueFromEvent(e);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateValueFromEvent(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateValueFromEvent(e);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    updateValueFromEvent(e);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging]);

  const percent = getPercent(value);

  const thumbStyle = isVertical
    ? {
        bottom: `calc(${percent}% - 8px)`,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    : {
        left: `calc(${percent}% - 8px)`,
        top: '50%',
        transform: 'translateY(-50%)',
      };

  let thumbElement;

  if (thumbShape === 'triangle') {
    thumbElement = (
      <div
        data-nodrag
        className='absolute w-0 h-0 border-l-8 border-r-8 border-b-14 border-l-transparent border-r-transparent'
        style={{
          ...(isVertical
            ? {
                bottom: thumbStyle.bottom,
                left: thumbStyle.left,
                transform: thumbStyle.transform,
              }
            : {
                left: thumbStyle.left,
                top: thumbStyle.top,
                transform: thumbStyle.transform,
              }),
          borderBottomColor: color,
        }}
      />
    );
  } else {
    thumbElement = (
      <div
        data-nodrag
        className={`absolute w-4 h-4 border-2 border-white shadow
          ${thumbShape === 'circle' ? 'rounded-full' : ''}
          ${thumbShape === 'diamond' ? 'rotate-45' : ''}
        `}
        style={{
          backgroundColor: color,
          ...thumbStyle,
        }}
      />
    );
  }

  return (
    <div
      id={id}
      data-nodrag
      ref={trackRef}
      className={`relative select-none touch-none cursor-pointer ${
        isVertical ? 'h-40 w-1' : 'w-full h-8'
      } rounded bg-red-5`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Gray track */}
      <div
        data-nodrag
        className={`absolute bg-gray-300 rounded ${
          isVertical
            ? 'w-2 left-1/2 -translate-x-1/2 h-full'
            : 'h-1 top-1/2 -translate-y-1/2 w-full'
        }`}
      />

      {/* Colored progress */}
      <div
        data-nodrag
        className={`absolute rounded ${
          isVertical
            ? 'left-1/2 -translate-x-1/2 w-2'
            : 'top-1/2 -translate-y-1/2 h-1'
        }`}
        style={{
          backgroundColor: color,
          ...(isVertical
            ? {
                bottom: 0,
                height: `${percent}%`,
              }
            : {
                left: 0,
                width: `${percent}%`,
              }),
        }}
      />

      {thumbElement}
    </div>
  );
};

export const hexToCustomRgb = (hex: string): string => {
  if (typeof hex !== 'string') {
    console.error('hexToRgba expected string, got:', hex);
    return `rgba(0,0,0,${0.0})`; // fallback
  }

  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Expand shorthand form (#abc => #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r} ${g} ${b}`;
};

export const hexToRgb = (hex: string): string => {
  if (typeof hex !== 'string') {
    console.error('hexToRgba expected string, got:', hex);
    return `rgba(0,0,0,${0.0})`; // fallback
  }

  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Expand shorthand form (#abc => #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgb(${r}, ${g}, ${b})`;
};

export const hexToRgba = (hex: string, alpha: number): string => {
  if (typeof hex !== 'string') {
    console.error('hexToRgba expected string, got:', hex);
    return `rgba(0,0,0,${alpha})`; // fallback
  }

  // Remove '#' if present
  hex = hex.replace(/^#/, '');

  // Expand shorthand form (#abc => #aabbcc)
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface KETextInputProps {
  color?: string;
  textColor?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
}

export const KETextInput: React.FC<KETextInputProps> = React.memo(
  ({
    value,
    onChange,
    placeholder = '',
    id = Math.random().toString(),
    color = '#fff',
    textColor = '#000',
  }) => (
    <label
      className='relative inline-block w-64 h-10 rounded-md border-2 border-gray-400 shadow-md cursor-text hover:border-blue-500'
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 0.75rem',
        backgroundColor: color,
        color: textColor,
      }}
    >
      <input
        id={id}
        type='text'
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          padding: '0 0.75rem',
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '1rem',
          cursor: 'text',
        }}
      />
      <span
        style={{
          pointerEvents: 'none',
          color: textColor,
        }}
      >
        {value || placeholder}
      </span>
    </label>
  )
);
