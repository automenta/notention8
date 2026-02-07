import React, { useState } from 'react';
import {
  SendIcon,
  LoadingSpinner,
  ArrowLeftIcon,
  CubeTransparentIcon,
  PlusCircleIcon,
  HelpIcon,
  SearchSparkleIcon
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
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <div className="flex-shrink-0 bg-gray-900/30">
      <div className="p-2 flex items-center gap-2">
        {onBack && (
             <button
                onClick={onBack}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                title="Back to List"
            >
                <ArrowLeftIcon className="h-5 w-5" />
            </button>
        )}

        <input
          id="note-title-input"
          type="text"
          value={title || ''}
          onChange={onTitleChange}
          placeholder="Note Title"
          autoFocus={!title}
          className="flex-grow bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-500 min-w-0"
        />

        {/* Save Template Button */}
        {onSaveTemplate && (
            <button
                onClick={onSaveTemplate}
                title="Save as Template"
                className="p-2 text-gray-400 hover:text-white transition-colors"
            >
                <PlusCircleIcon className="h-5 w-5" />
            </button>
        )}

        {/* Help Button */}
        <button
            onClick={() => setIsHelpOpen(true)}
            title="Help & Syntax"
            aria-label="Help & Syntax"
            className="p-2 text-gray-400 hover:text-white transition-colors"
        >
            <HelpIcon className="h-5 w-5" />
        </button>

        {onToggleInspector && (
            <button
                onClick={onToggleInspector}
                title={isInspectorOpen ? "Hide Properties" : "Show Properties"}
                className={`p-2 transition-colors ${isInspectorOpen ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-white'}`}
            >
                <CubeTransparentIcon className="h-5 w-5" />
            </button>
        )}

        {onFindMatches && (
            <button
              onClick={onFindMatches}
              title="Find matches in network"
              className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <SearchSparkleIcon className="h-5 w-5" />
            </button>
        )}
        <button
          onClick={onPublish}
          disabled={isPublishing}
          title={isPublished ? 'Publish update' : 'Publish to Nostr'}
          className="p-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
        >
          {isPublishing ? (
            <LoadingSpinner className="h-5 w-5" />
          ) : (
            <SendIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      <div className="px-2 pb-2">
        <TagInput
          tags={tags}
          onChange={onTagsChange}
          onAutoTag={isApiKeyAvailable ? onAutoTag : undefined}
          isAutoTagging={isAutoTagging}
        />
      </div>
      <div className="border-b border-gray-700/50" />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
