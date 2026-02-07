import React from 'react';

export interface NavButtonProps {
  icon: React.ReactElement<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}

export const NavButton: React.FC<NavButtonProps> = ({
  icon,
  label,
  isActive,
  onClick,
  badgeCount,
}) => {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-pressed={isActive}
      className={`relative p-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isActive
          ? 'bg-blue-600/30 text-white shadow-sm'
          : 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
      }`}
    >
      {React.cloneElement(icon, { className: 'h-6 w-6' })}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-1 ring-gray-900">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </button>
  );
};
