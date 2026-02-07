import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, children, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
          {...props}
        >
          {options ? (
            options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          ) : (
            children
          )}
        </select>
        {/* Custom arrow icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
