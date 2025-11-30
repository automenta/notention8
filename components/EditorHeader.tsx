import React from 'react';
import { SendIcon, LoadingSpinner } from './icons';
import { TagInput } from './TagInput';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
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
