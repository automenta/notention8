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
import { IconButton } from '../common/IconButton';

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
                <IconButton
                    onClick={onSaveTemplate}
                    title="Save as Template"
                    icon={PlusCircleIcon}
                    size="md"
                    variant="ghost"
                    className="rounded-md"
                />
            )}

            {onToggleToolbar && (
                <IconButton
                    onClick={onToggleToolbar}
                    title={isToolbarVisible ? "Hide Toolbar" : "Show Formatting Toolbar"}
                    icon={PencilIcon}
                    size="md"
                    variant="ghost"
                    isActive={isToolbarVisible}
                    className="rounded-md"
                />
            )}

            <IconButton
                onClick={onToggleTags}
                title={isTagInputVisible ? "Hide Tags" : "Add/Edit Tags"}
                icon={TagIcon}
                size="md"
                variant="ghost"
                isActive={isTagInputVisible}
                className="rounded-md"
            />

            {onExport && (
                <IconButton
                    onClick={onExport}
                    title="Export JSON"
                    icon={DownloadIcon}
                    size="md"
                    variant="ghost"
                    className="rounded-md"
                />
            )}

            {onCopyContent && (
                <IconButton
                    onClick={onCopyContent}
                    title="Copy Content"
                    icon={ClipboardIcon}
                    size="md"
                    variant="ghost"
                    className="rounded-md"
                />
            )}

            <IconButton
                onClick={onOpenHelp}
                title="Help & Syntax"
                icon={HelpIcon}
                size="md"
                variant="ghost"
                className="rounded-md"
            />

            {onToggleInspector && (
                <IconButton
                    onClick={onToggleInspector}
                    title={isInspectorOpen ? "Hide Properties" : "Show Properties"}
                    icon={CubeTransparentIcon}
                    size="md"
                    variant="ghost"
                    isActive={isInspectorOpen}
                    className="rounded-md"
                />
            )}
        </div>
    );
};
