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
  DownloadIcon
} from './icons';
import { TagInput } from './TagInput';
import { HelpModal } from './common/HelpModal';

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
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex-shrink-0 bg-gray-900 border-b border-gray-700/50">
      <div className="flex items-center gap-3 p-3">
        {onBack && (
             <button
                onClick={onBack}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                title="Back to List"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
        )}

        <div className="flex-grow min-w-0">
            <input
              id="note-title-input"
              type="text"
              value={title || ''}
              onChange={onTitleChange}
              placeholder="Untitled Note"
              autoFocus={!title}
              className="w-full bg-transparent text-white text-xl font-bold focus:outline-none placeholder-gray-600"
            />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
             {/* Navigation Buttons */}
            {(onPrevious || onNext) && (
                 <div className="flex items-center bg-gray-800 rounded-md mr-2">
                     <button
                         onClick={onPrevious}
                         disabled={!hasPrevious}
                         className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-l-md hover:bg-gray-700"
                         title="Previous Note (Alt+Up)"
                     >
                         <ChevronUpIcon className="h-5 w-5" />
                     </button>
                     <div className="w-px h-4 bg-gray-700"></div>
                     <button
                         onClick={onNext}
                         disabled={!hasNext}
                         className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-r-md hover:bg-gray-700"
                         title="Next Note (Alt+Down)"
                     >
                         <ChevronDownIcon className="h-5 w-5" />
                     </button>
                 </div>
            )}

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-1 border-l border-gray-700/50 pl-2">
                {onSaveTemplate && (
                    <button
                        onClick={onSaveTemplate}
                        title="Save as Template"
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                    </button>
                )}

                {onExport && (
                    <button
                        onClick={onExport}
                        title="Export JSON"
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                    >
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                )}

                <button
                    onClick={() => setIsHelpOpen(true)}
                    title="Help & Syntax"
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                >
                    <HelpIcon className="h-5 w-5" />
                </button>

                {onToggleInspector && (
                    <button
                        onClick={onToggleInspector}
                        title={isInspectorOpen ? "Hide Properties" : "Show Properties"}
                        className={`p-2 transition-colors rounded-md hover:bg-gray-800 ${isInspectorOpen ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <CubeTransparentIcon className="h-5 w-5" />
                    </button>
                )}
            </div>

            {/* Primary Actions */}
            <div className="flex items-center gap-1 pl-1 md:pl-2 md:border-l border-gray-700/50">
                {onFindMatches && (
                    <button
                      onClick={onFindMatches}
                      title="Find matches in network"
                      className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-md transition-colors"
                    >
                      <SearchSparkleIcon className="h-5 w-5" />
                    </button>
                )}

                <button
                  onClick={onPublish}
                  disabled={isPublishing}
                  title={isPublished ? 'Publish update' : 'Publish to Nostr'}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? (
                    <LoadingSpinner className="h-5 w-5" />
                  ) : (
                    <SendIcon className="h-5 w-5" />
                  )}
                </button>
            </div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <TagInput
          tags={tags}
          onChange={onTagsChange}
          onAutoTag={isApiKeyAvailable ? onAutoTag : undefined}
          isAutoTagging={isAutoTagging}
        />
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
