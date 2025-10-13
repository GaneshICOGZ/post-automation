import React from 'react';

const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows = 4,
  className = '',
  ...props
}) => {
  const textareaClasses = `
    w-full px-3 py-2 border border-gray-300 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 resize-vertical
    ${error ? 'border-red-500 focus:ring-red-500' : ''}
    ${className}
  `.trim();

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={rows}
        className={textareaClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Textarea;
