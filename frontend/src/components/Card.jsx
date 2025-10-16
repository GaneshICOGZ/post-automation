import React from 'react';

const Card = ({
  children,
  className = '',
  padding = true,
  shadow = true,
  glassmorphism = false,
  hover = false,
  ...props
}) => {
  const baseClasses = 'rounded-2xl border-0';

  const paddingClasses = padding ? 'p-6' : '';

  const shadowClasses = shadow ? 'shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50' : '';

  const hoverClasses = hover ? 'hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:scale-[1.02] transition-all duration-300' : '';

  const glassClasses = glassmorphism ? 'backdrop-blur-sm bg-white/80 dark:bg-slate-800/80' : 'bg-white dark:bg-slate-900';

  return (
    <div
      className={`
        ${baseClasses}
        ${paddingClasses}
        ${shadowClasses}
        ${hoverClasses}
        ${glassClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
