import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, ChevronDownIcon, SparklesIcon, CubeTransparentIcon } from './icons';

interface NewNoteButtonProps {
    onNewNote: () => void;
    onCreateIntent: (type: 'request' | 'offer') => void;
}

export const NewNoteButton: React.FC<NewNoteButtonProps> = ({ onNewNote, onCreateIntent }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleIntentClick = (type: 'request' | 'offer') => {
        onCreateIntent(type);
        setIsDropdownOpen(false);
    }

    return (
        <div className="relative ml-4" ref={dropdownRef}>
            <div className="flex bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors">
                <button
                    onClick={onNewNote}
                    className="flex items-center gap-2 px-3 py-2 text-white font-medium border-r border-blue-500 rounded-l-lg hover:bg-blue-800/20"
                    title="New Note"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">New Note</span>
                </button>
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-2 py-2 text-white hover:bg-blue-800/20 rounded-r-lg"
                    title="More options"
                >
                    <ChevronDownIcon className="w-4 h-4" />
                </button>
            </div>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in">
                    <button
                        onClick={() => handleIntentClick('request')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3 group"
                    >
                        <div className="p-1.5 bg-purple-900/50 rounded-md group-hover:bg-purple-900 transition-colors">
                            <SparklesIcon className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-200">New Request</div>
                            <div className="text-xs text-gray-500">Find something</div>
                        </div>
                    </button>
                    <button
                        onClick={() => handleIntentClick('offer')}
                        className="w-full text-left px-4 py-3 hover:bg-gray-700 flex items-center gap-3 group"
                    >
                        <div className="p-1.5 bg-green-900/50 rounded-md group-hover:bg-green-900 transition-colors">
                            <CubeTransparentIcon className="w-4 h-4 text-green-400" />
                        </div>
                         <div>
                            <div className="text-sm font-medium text-gray-200">New Offer</div>
                            <div className="text-xs text-gray-500">Provide services</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};
