import React from 'react';
import { useRouter } from 'next/navigation';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'default',
  disabled = false,
  loading = false,
  href,
  className = '',
  ...props
}) => {
  const router = useRouter();

  const baseStyles = `
    font-semibold rounded-lg transition-all duration-300
    inline-flex items-center justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-4 focus:ring-primary/20
    hover:shadow-lg active:scale-95
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-primary to-primary/80 via-accent
      text-primary-foreground hover:from-primary/90 hover:to-primary/70
      border border-primary/20
      shadow-md hover:shadow-primary/25
    `,
    secondary: `
      bg-secondary text-secondary-foreground
      border border-border hover:bg-secondary/80
      hover:shadow-secondary/25
    `,
    outline: `
      border-2 border-primary text-primary bg-transparent
      hover:bg-primary hover:text-primary-foreground
    `,
    ghost: `
      text-muted-foreground hover:text-foreground hover:bg-accent
      border border-transparent
    `,
    destructive: `
      bg-error text-white hover:bg-error/80
      border border-error/20
    `,
    accent: `
      bg-gradient-to-r from-accent to-accent/80
      text-accent-foreground border border-accent/20
      hover:shadow-accent/25
    `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm gap-1.5 min-h-[2rem]',
    default: 'px-4 py-2 gap-2 min-h-[2.5rem]',
    lg: 'px-6 py-3 text-lg gap-2 min-h-[3rem]',
    xl: 'px-8 py-4 text-xl gap-3 min-h-[3.5rem]',
  };

  const handleClick = (e) => {
    if (href) {
      e.preventDefault();
      router.push(href);
    }
    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && children}
    </button>
  );
};

export default Button;
