import React from 'react';
import {
    PlusCircleIcon,
    PencilIcon,
    TagIcon,
    DownloadIcon,
    ClipboardIcon,
    HelpIcon,
    CubeTransparentIcon
} from '../layout/icons';

interface EditorToolbarProps {
    onSaveTemplate?: () => void;
    onToggleToolbar?: () => void;
    isToolbarVisible?: boolean;
    onToggleTags: () => void;
    isTagInputVisible: boolean;
    onExport?: () => void;
    onCopyContent?: () => void;
    onOpenHelp: () => void;
    onToggleInspector?: () => void;
    isInspectorOpen?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onSaveTemplate,
    onToggleToolbar,
    isToolbarVisible,
    onToggleTags,
    isTagInputVisible,
    onExport,
    onCopyContent,
    onOpenHelp,
    onToggleInspector,
    isInspectorOpen
}) => {
    return (
        <div className="hidden md:flex items-center gap-0.5 bg-gray-800/30 rounded-lg p-0.5 border border-gray-700/30">
            {onSaveTemplate && (
                <button
                    onClick={onSaveTemplate}
                    title="Save as Template"
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                >
                    <PlusCircleIcon className="h-5 w-5" />
                </button>
            )}

            {onToggleToolbar && (
                <button
                    onClick={onToggleToolbar}
                    title={isToolbarVisible ? "Hide Toolbar" : "Show Formatting Toolbar"}
                    className={`p-1.5 transition-colors rounded-md hover:bg-gray-700/50 ${isToolbarVisible ? 'text-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-white'}`}
                >
                    <PencilIcon className="h-5 w-5" />
                </button>
            )}

            <button
                onClick={onToggleTags}
                title={isTagInputVisible ? "Hide Tags" : "Add/Edit Tags"}
                className={`p-1.5 transition-colors rounded-md hover:bg-gray-700/50 ${isTagInputVisible ? 'text-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-white'}`}
            >
                <TagIcon className="h-5 w-5" />
            </button>

            {onExport && (
                <button
                    onClick={onExport}
                    title="Export JSON"
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                >
                    <DownloadIcon className="h-5 w-5" />
                </button>
            )}

            {onCopyContent && (
                <button
                    onClick={onCopyContent}
                    title="Copy Content"
                    className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
                >
                    <ClipboardIcon className="h-5 w-5" />
                </button>
            )}

            <button
                onClick={onOpenHelp}
                title="Help & Syntax"
                className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-700/50"
            >
                <HelpIcon className="h-5 w-5" />
            </button>

            {onToggleInspector && (
                <button
                    onClick={onToggleInspector}
                    title={isInspectorOpen ? "Hide Properties" : "Show Properties"}
                    className={`p-1.5 transition-colors rounded-md hover:bg-gray-700/50 ${isInspectorOpen ? 'text-blue-400 bg-blue-900/10' : 'text-gray-400 hover:text-white'}`}
                >
                    <CubeTransparentIcon className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
