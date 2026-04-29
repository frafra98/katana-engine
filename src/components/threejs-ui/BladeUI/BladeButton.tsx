import React from 'react';

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  replaceClassName?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>; 
  id?: string;
}

const BladeButton: React.FC<CustomButtonProps> = ({
  children,
  color = '',
  className = '',
  replaceClassName = false,
  onClick,
  id = Math.random().toString(),
  ...props
}) => {


  return (
    <button
      id={id}
      style={{ backgroundColor: color }}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default BladeButton;
