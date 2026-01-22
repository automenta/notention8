import React from 'react';
import {
  CodeBracketsIcon,
  DocumentDuplicateIcon,
  EditIcon,
  TagIcon,
  HelpIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '../layout/icons';
import { IconButton } from '../common/IconButton';

interface EditorToolbarProps {
    onSaveTemplate?: () => void;
    onToggleToolbar?: () => void;
    isToolbarVisible: boolean;
    onToggleTags: () => void;
    isTagInputVisible: boolean;
    onExport?: () => void;
    onCopyContent?: () => void;
    onOpenHelp?: () => void;
    onToggleInspector?: () => void;
    isInspectorOpen?: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    onSaveTemplate,
    onToggleToolbar,
    isToolbarVisible,
    onToggleTags,
    isTagInputVisible,
    onCopyContent,
    onOpenHelp,
    onToggleInspector,
    isInspectorOpen
}) => {
    return (
        <div className="flex items-center gap-1 border-r border-gray-700/50 pr-2 mr-2">
            {onToggleToolbar && (
                <IconButton
                    onClick={onToggleToolbar}
                    title={isToolbarVisible ? "Hide Formatting Toolbar" : "Show Formatting Toolbar"}
                    icon={isToolbarVisible ? ChevronUpIcon : ChevronDownIcon}
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                />
            )}
             <IconButton
                onClick={onToggleTags}
                title="Tags"
                icon={TagIcon}
                variant="ghost"
                isActive={isTagInputVisible}
                size="sm"
             />
             {onToggleInspector && (
                 <IconButton
                    onClick={onToggleInspector}
                    title="Toggle Property Inspector"
                    icon={CodeBracketsIcon}
                    variant="ghost"
                    isActive={isInspectorOpen}
                    size="sm"
                 />
             )}
            {onSaveTemplate && (
                <IconButton
                    onClick={onSaveTemplate}
                    title="Save as Template"
                    icon={DocumentDuplicateIcon}
                    variant="ghost"
                    size="sm"
                />
            )}
             {onCopyContent && (
                <IconButton
                    onClick={onCopyContent}
                    title="Copy Content"
                    icon={EditIcon}
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                />
            )}
             {onOpenHelp && (
                 <IconButton
                    onClick={onOpenHelp}
                    title="Help & Shortcuts"
                    icon={HelpIcon}
                    variant="ghost"
                    size="sm"
                />
             )}
        </div>
    );
};
