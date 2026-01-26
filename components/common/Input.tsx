import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
