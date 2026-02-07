import React from 'react';

export interface QuickActionBtnProps {
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    colorClass: string;
    hoverBorder: string;
    hoverShadow: string;
}

export const QuickActionBtn: React.FC<QuickActionBtnProps> = ({ onClick, icon: Icon, label, colorClass, hoverBorder, hoverShadow }) => (
    <button
        onClick={onClick}
        className={`group p-6 bg-gray-800 hover:bg-gray-750 rounded-2xl flex flex-col items-center gap-4 transition-all border border-gray-700/50 ${hoverBorder} hover:shadow-lg ${hoverShadow}`}
    >
        <div className={`p-4 rounded-full transition-all transform group-hover:scale-110 ${colorClass} group-hover:text-white`}>
            <Icon className="h-8 w-8" />
        </div>
        <span className="font-medium text-gray-200 group-hover:text-white">{label}</span>
    </button>
);
