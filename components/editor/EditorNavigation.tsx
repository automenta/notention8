import React from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '../layout/icons';

export interface EditorNavigationProps {
    onNext?: () => void;
    onPrevious?: () => void;
    hasNext?: boolean;
    hasPrevious?: boolean;
}

export const EditorNavigation: React.FC<EditorNavigationProps> = ({
    onNext,
    onPrevious,
    hasNext,
    hasPrevious
}) => {
    if (!onNext && !onPrevious) return null;

    return (
        <div className="hidden md:flex items-center bg-gray-800/50 rounded-lg border border-gray-700/50">
            <button
                onClick={onPrevious}
                disabled={!hasPrevious}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-lg hover:bg-gray-700/50"
                title="Previous Note (Alt+Up)"
            >
                <ChevronUpIcon className="h-5 w-5" />
            </button>
            <div className="w-px h-4 bg-gray-700/50"></div>
            <button
                onClick={onNext}
                disabled={!hasNext}
                className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-lg hover:bg-gray-700/50"
                title="Next Note (Alt+Down)"
            >
                <ChevronDownIcon className="h-5 w-5" />
            </button>
        </div>
    );
};
