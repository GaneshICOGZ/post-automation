import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  ...props
}) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || headerAction) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
