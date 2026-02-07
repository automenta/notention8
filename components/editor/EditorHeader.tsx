import React, { useState } from 'react';
import {
    ArrowLeftIcon,
    LockIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CodeBracketsIcon,
    TagIcon,
    DocumentDuplicateIcon,
    EditIcon,
    HelpIcon,
    SearchSparkleIcon,
    SendIcon
} from '../layout/icons';
import { TagInput } from './TagInput';
import { HelpModal } from '../common/HelpModal';
import { IconButton } from '../common/IconButton';
import { Button } from '../common/Button';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  onFindMatches?: () => void;
  onBack?: () => void;
  isPublishing: boolean;
  isPublished: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onAutoTag?: () => void;
  isAutoTagging: boolean;
  isApiKeyAvailable: boolean;
  isInspectorOpen?: boolean;
  onToggleInspector?: () => void;
  onSaveTemplate?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  onExport?: () => void;
  onCopyContent?: () => void;
  readOnly?: boolean;
  isToolbarVisible?: boolean;
  onToggleToolbar?: () => void;
  actionLabel?: string;
  missingProperties?: string[];
  onAddProperty?: (key: string) => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  title,
  onTitleChange,
  onPublish,
  isPublishing,
  isPublished,
  tags,
  onTagsChange,
  onAutoTag,
  isAutoTagging,
  isApiKeyAvailable,
  onFindMatches,
  onBack,
  isInspectorOpen,
  onToggleInspector,
  onSaveTemplate,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  onExport,
  onCopyContent,
  readOnly = false,
  isToolbarVisible = true,
  onToggleToolbar,
  actionLabel = 'Publish',
  missingProperties = [],
  onAddProperty
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isTagInputVisible, setIsTagInputVisible] = useState(tags.length > 0);

  const handleToggleTags = () => {
      setIsTagInputVisible(prev => !prev);
  };

  return (
    <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700/50">
      <div className="flex items-center gap-3 p-3">
        {onBack && (
            <div className="md:hidden mr-1">
                <IconButton
                    onClick={onBack}
                    title="Back to List"
                    icon={ArrowLeftIcon}
                    variant="secondary"
                />
            </div>
        )}

        <div className="flex-grow min-w-0 flex items-center mr-2">
            <div className="relative w-full">
                <input
                    id="note-title-input"
                    type="text"
                    value={title || ''}
                    onChange={onTitleChange}
                    placeholder="Untitled Note"
                    autoFocus={!title && !readOnly}
                    readOnly={readOnly}
                    disabled={readOnly}
                    className={`w-full bg-transparent text-white text-xl font-bold focus:outline-none placeholder-gray-700 transition-colors focus:placeholder-gray-600 py-1 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
                />
            </div>
            {readOnly && <LockIcon className="h-4 w-4 text-gray-500 ml-2 flex-shrink-0" />}
        </div>

        {/* Unified Controls Section */}
        <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation */}
            {(onNext || onPrevious) && (
                <div className="hidden md:flex items-center bg-gray-800/50 rounded-lg border border-gray-700/50 mr-2">
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
            )}

            {/* View/Tool Toggles */}
            <div className="flex items-center gap-1 border-r border-gray-700/50 pr-2 mr-1">
                 {onToggleToolbar && (
                    <IconButton
                        onClick={onToggleToolbar}
                        tooltip={isToolbarVisible ? "Hide Formatting Toolbar" : "Show Formatting Toolbar"}
                        icon={isToolbarVisible ? ChevronUpIcon : ChevronDownIcon}
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex"
                    />
                )}
                {onToggleInspector && (
                    <IconButton
                        onClick={onToggleInspector}
                        tooltip="Toggle Property Inspector"
                        icon={CodeBracketsIcon}
                        variant="ghost"
                        isActive={isInspectorOpen}
                        size="sm"
                    />
                )}
                 <IconButton
                    onClick={handleToggleTags}
                    tooltip="Tags"
                    icon={TagIcon}
                    variant="ghost"
                    isActive={isTagInputVisible}
                    size="sm"
                />
            </div>

            {/* Note Actions */}
            <div className="flex items-center gap-1 border-r border-gray-700/50 pr-2 mr-1 hidden sm:flex">
                {onSaveTemplate && (
                    <IconButton
                        onClick={onSaveTemplate}
                        tooltip="Save as Template"
                        icon={DocumentDuplicateIcon}
                        variant="ghost"
                        size="sm"
                    />
                )}
                 {onCopyContent && (
                    <IconButton
                        onClick={onCopyContent}
                        tooltip="Copy Content"
                        icon={EditIcon}
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex"
                    />
                )}
                 <IconButton
                    onClick={() => setIsHelpOpen(true)}
                    tooltip="Help & Shortcuts"
                    icon={HelpIcon}
                    variant="ghost"
                    size="sm"
                />
            </div>

            {/* Network Actions */}
             <div className="flex items-center gap-2">
                 {/* Property Hints */}
                 {missingProperties.length > 0 && onAddProperty && (
                    <div className="hidden lg:flex items-center gap-1 mr-2 animate-fade-in">
                        <span className="text-xs text-yellow-500 mr-1">Missing:</span>
                        {missingProperties.map(prop => (
                            <button
                                key={prop}
                                onClick={() => onAddProperty(prop)}
                                className="px-2 py-0.5 text-xs bg-yellow-900/30 text-yellow-200 border border-yellow-700/50 rounded-full hover:bg-yellow-900/50 transition-colors"
                                title={`Add property: ${prop}`}
                            >
                                + {prop}
                            </button>
                        ))}
                    </div>
                )}

                {onFindMatches && (
                    <IconButton
                      onClick={onFindMatches}
                      tooltip="Find matches in network"
                      icon={SearchSparkleIcon}
                      className="text-purple-400 hover:bg-purple-600 hover:text-white"
                      size="lg"
                    />
                )}

                <Button
                  onClick={onPublish}
                  isLoading={isPublishing}
                  title={isPublished ? 'Update on Nostr' : actionLabel}
                  icon={SendIcon}
                  variant={actionLabel !== 'Publish' ? 'primary' : 'ghost'}
                  className={actionLabel === 'Publish' ? 'text-blue-400 hover:text-white hover:bg-blue-600' : ''}
                  size="sm"
                >
                  {actionLabel !== 'Publish' && actionLabel}
                </Button>
            </div>
        </div>
      </div>

      {isTagInputVisible && (
          <div className="px-3 pb-3 animate-fade-in">
            <TagInput
              tags={tags}
              onChange={onTagsChange}
              onAutoTag={isApiKeyAvailable ? onAutoTag : undefined}
              isAutoTagging={isAutoTagging}
              autoFocus={true}
              className="p-1.5 bg-gray-900/50 rounded-md border border-gray-700/30"
            />
          </div>
      )}

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
