import React from 'react';

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-2xl border border-gray-700/50 p-6 ${className}`}>
      {children}
    </div>
  );
};
