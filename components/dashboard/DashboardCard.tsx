import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ElementType;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '', title, icon: Icon }) => {
  return (
    <div className={`bg-gray-800 rounded-2xl border border-gray-700/50 p-6 ${className}`}>
      {(title || Icon) && (
        <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5" />}
            {title}
        </h3>
      )}
      {children}
    </div>
  );
};
