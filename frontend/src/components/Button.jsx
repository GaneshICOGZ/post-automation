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
    font-medium rounded-lg transition-all duration-300
    inline-flex items-center justify-center
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
  `;

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-blue-500 to-purple-600
      text-white hover:scale-105 hover:shadow-lg
      hover:shadow-blue-500/25 dark:hover:shadow-blue-500/10
    `,
    secondary: `
      bg-gradient-to-r from-gray-100 to-gray-200
      dark:from-gray-700 dark:to-gray-600
      text-gray-800 dark:text-white
      hover:scale-105 hover:shadow-lg
    `,
    outline: `
      border-2 border-blue-500 text-blue-500 bg-transparent
      hover:bg-blue-500 hover:text-white hover:scale-105
    `,
    ghost: `
      text-gray-600 dark:text-gray-300
      hover:bg-gray-100 dark:hover:bg-gray-700
      hover:text-gray-900 dark:hover:text-white
    `,
    destructive: `
      bg-red-500 hover:bg-red-600 text-white hover:scale-105
    `,
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm gap-2',
    default: 'px-6 py-3 gap-2.5',
    lg: 'px-8 py-4 text-lg gap-3',
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
          className="animate-spin -ml-1 mr-3 h-4 w-4"
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
      {children}
    </button>
  );
};

export default Button;
