import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
                w-full bg-gray-900/50 border border-gray-700/50 rounded-lg py-2.5 text-white
                focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50
                transition-all placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed
                ${leftIcon ? 'pl-10' : 'px-3'}
                ${rightIcon ? 'pr-10' : 'px-3'}
                ${error ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
