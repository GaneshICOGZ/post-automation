import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  className = '',
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const baseStyles = `
    w-full px-4 py-3 rounded-lg border transition-all duration-300
    bg-card text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const borderStyles = error
    ? 'border-error focus:ring-error/20'
    : 'border-input focus:border-primary';

  const size = 'min-h-[3rem] text-base';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            ${baseStyles}
            ${borderStyles}
            ${size}
            ${icon ? 'pl-12' : ''}
          `}
          {...props}
        />

        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export const Textarea = ({
  placeholder,
  value,
  onChange,
  error,
  label,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const baseStyles = `
    w-full px-4 py-3 rounded-lg border transition-all duration-300
    bg-card text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
    resize-vertical min-h-[6rem]
  `;

  const borderStyles = error
    ? 'border-error focus:ring-error/20'
    : 'border-input focus:border-primary';

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        className={`
          ${baseStyles}
          ${borderStyles}
        `}
        {...props}
      />

      {error && (
        <p className="text-sm text-error animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
