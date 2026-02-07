import React from 'react';
import { SendIcon, LoadingSpinner } from './icons';
import { TagInput } from './TagInput';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  onFindMatches?: () => void;
  isPublishing: boolean;
  isPublished: boolean;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  onAutoTag?: () => void;
  isAutoTagging: boolean;
  isApiKeyAvailable: boolean;
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
}) => {
  return (
    <div className="flex-shrink-0 bg-gray-900/30">
      <div className="p-2 flex items-center gap-2">
        <input
          type="text"
          value={title || ''}
          onChange={onTitleChange}
          placeholder="Note Title"
          className="flex-grow bg-transparent text-white text-lg font-bold focus:outline-none placeholder-gray-500"
        />
        {onFindMatches && (
            <button
              onClick={onFindMatches}
              title="Find matches in network"
              className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
              </svg>
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
    </div>
  );
};
