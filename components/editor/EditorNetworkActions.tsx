import React from 'react';
import { SearchSparkleIcon, SendIcon } from '../layout/icons';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';

interface EditorNetworkActionsProps {
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
                <IconButton
                  onClick={onFindMatches}
                  title="Find matches in network"
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
    );
};
