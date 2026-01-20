import React from 'react';
import { KeyIcon, SettingsIcon } from '../layout/icons';

interface ConnectIdentityPromptProps {
    onNavigateToSettings: () => void;
}

export const ConnectIdentityPrompt: React.FC<ConnectIdentityPromptProps> = ({ onNavigateToSettings }) => {
    return (
        <div className="p-8 h-full flex flex-col items-center justify-center text-center bg-gray-800/50 rounded-lg">
            <KeyIcon className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
                Connect your Nostr Identity
            </h2>
            <p className="text-gray-400 mb-6 max-w-md">
                A Nostr identity is required to publish notes and interact with the
                network. You can generate one in settings.
            </p>
            <button
                onClick={onNavigateToSettings}
                className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
                <SettingsIcon className="h-5 w-5" /> Go to Settings
            </button>
        </div>
    );
};
