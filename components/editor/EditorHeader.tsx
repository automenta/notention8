import React, { useState } from 'react';
import {
  SendIcon,
  LoadingSpinner,
  ArrowLeftIcon,
  CubeTransparentIcon,
  PlusCircleIcon,
  HelpIcon,
  SearchSparkleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DownloadIcon,
  LockIcon,
  ClipboardIcon,
  TagIcon,
  PencilIcon
} from '../layout/icons';
import { TagInput } from './TagInput';
import { HelpModal } from '../common/HelpModal';

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
             <button
                onClick={onBack}
                className="md:hidden p-2 text-gray-200 hover:text-white bg-gray-800/50 hover:bg-gray-800 transition-colors rounded-lg mr-1"
                title="Back to List"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
        )}

        <div className="flex-grow min-w-0 flex items-center">
            <input
              id="note-title-input"
              type="text"
              value={title || ''}
              onChange={onTitleChange}
              placeholder="Untitled Note"
              autoFocus={!title && !readOnly}
              readOnly={readOnly}
              disabled={readOnly}
              className={`w-full bg-transparent text-white text-xl font-bold focus:outline-none placeholder-gray-700 transition-colors focus:placeholder-gray-600 ${readOnly ? 'cursor-not-allowed opacity-75' : ''}`}
            />
            {readOnly && <LockIcon className="h-4 w-4 text-gray-500 ml-2 flex-shrink-0" />}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
             {/* Navigation Buttons */}
            {(onPrevious || onNext) && (
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
            )}

            {/* Tools Group */}
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
                    onClick={handleToggleTags}
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
                    onClick={() => setIsHelpOpen(true)}
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

            {/* Network Actions */}
            <div className="flex items-center gap-2 pl-1">
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
                    <button
                      onClick={onFindMatches}
                      title="Find matches in network"
                      className="p-2 text-purple-400 hover:text-white hover:bg-purple-600 rounded-lg transition-all"
                    >
                      <SearchSparkleIcon className="h-5 w-5" />
                    </button>
                )}

                <button
                  onClick={onPublish}
                  disabled={isPublishing}
                  title={isPublished ? 'Update on Nostr' : actionLabel}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm
                    ${actionLabel !== 'Publish'
                        ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                        : 'text-blue-400 hover:text-white hover:bg-blue-600'
                    }`}
                >
                  {isPublishing ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                  {actionLabel !== 'Publish' && <span>{actionLabel}</span>}
                </button>
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
