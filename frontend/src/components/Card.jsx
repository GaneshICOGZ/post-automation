import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  padding = 'default',
  shadow = true,
  glass = false,
  hoverable = false,
  ...props
}) => {
  const baseStyles = `
    bg-card rounded-xl border border-border
    transition-all duration-300
  `;

  const shadowStyles = shadow ? 'shadow-lg shadow-border/50' : '';

  const glassStyles = glass ? `
    glass backdrop-blur-sm border-white/20
  ` : '';

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    default: 'p-5',
    lg: 'p-6',
    xl: 'p-8',
  };

  const hoverStyles = hoverable ? `
    hover:scale-[1.02] hover:shadow-xl
    hover:shadow-primary/10 hover:border-primary/30
  ` : '';

  const clickableStyles = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`
        ${baseStyles}
        ${shadowStyles}
        ${glassStyles}
        ${paddingStyles[padding]}
        ${hoverStyles}
        ${clickableStyles}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => (
  <div className={`space-y-1.5 pb-4 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`py-2 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }) => (
  <div className={`flex items-center pt-4 ${className}`}>
    {children}
  </div>
);

export { CardHeader, CardContent, CardFooter };
export default Card;
