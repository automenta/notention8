import React, { useState } from 'react';
import { ArrowLeftIcon, LockIcon } from '../layout/icons';
import { TagInput } from './TagInput';
import { HelpModal } from '../common/HelpModal';
import { EditorNavigation } from './EditorNavigation';
import { EditorToolbar } from './EditorToolbar';
import { EditorNetworkActions } from './EditorNetworkActions';

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
            <EditorNavigation
                onNext={onNext}
                onPrevious={onPrevious}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
            />

            <EditorToolbar
                onSaveTemplate={onSaveTemplate}
                onToggleToolbar={onToggleToolbar}
                isToolbarVisible={isToolbarVisible}
                onToggleTags={handleToggleTags}
                isTagInputVisible={isTagInputVisible}
                onExport={onExport}
                onCopyContent={onCopyContent}
                onOpenHelp={() => setIsHelpOpen(true)}
                onToggleInspector={onToggleInspector}
                isInspectorOpen={isInspectorOpen}
            />

            <EditorNetworkActions
                missingProperties={missingProperties}
                onAddProperty={onAddProperty}
                onFindMatches={onFindMatches}
                onPublish={onPublish}
                isPublishing={isPublishing}
                isPublished={isPublished}
                actionLabel={actionLabel}
            />
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
