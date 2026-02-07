import React from 'react';
import { SearchSparkleIcon, SendIcon, LoadingSpinner } from '../layout/icons';

export interface EditorNetworkActionsProps {
    missingProperties: string[];
    onAddProperty?: (key: string) => void;
    onFindMatches?: () => void;
    onPublish: () => void;
    isPublishing: boolean;
    isPublished: boolean;
    actionLabel: string;
}

export const EditorNetworkActions: React.FC<EditorNetworkActionsProps> = ({
    missingProperties,
    onAddProperty,
    onFindMatches,
    onPublish,
    isPublishing,
    isPublished,
    actionLabel
}) => {
    return (
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
    );
};
