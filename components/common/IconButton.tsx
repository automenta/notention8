import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  isActive = false,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  title,
  ...props
}) => {
  const baseClasses = "rounded-lg transition-all duration-200 flex items-center justify-center";

  const sizeClasses = {
    sm: "p-1",
    md: "p-1.5",
    lg: "p-2",
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return "bg-blue-600 hover:bg-blue-700 text-white shadow-sm";
      case 'secondary':
        return "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700";
      case 'ghost':
      default:
        return isActive
          ? "bg-blue-600/90 text-white shadow-sm"
          : "text-gray-400 hover:text-white hover:bg-gray-800";
    }
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      title={title}
      type="button"
      aria-pressed={isActive}
      {...props}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};
