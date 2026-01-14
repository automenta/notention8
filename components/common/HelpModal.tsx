import React from 'react';
import { Modal } from './Modal';
import { TagIcon } from '../icons';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Notention Help">
            <div className="space-y-4 text-gray-300">
                <p>
                    Notention is a semantic note-taking app that helps you connect with others.
                    Use special syntax to make your notes machine-readable.
                </p>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-blue-400" />
                        Semantic Syntax
                    </h3>
                    <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm space-y-2">
                        <div className="flex gap-2">
                            <span className="text-blue-400">[key:op:value]</span>
                            <span className="text-gray-500">Canonical Format</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-green-400">[key op value]</span>
                            <span className="text-gray-500">Natural Format</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Real (Facts)</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                            <li><code className="text-blue-300">is</code> : Exact match</li>
                            <li><code className="text-blue-300">is not</code> : Negative match</li>
                        </ul>
                        <div className="mt-2 text-xs text-gray-500">
                            Ex: <code className="text-gray-300">[role:is:Engineer]</code>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-200 mb-2">Imaginary (Constraints)</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside text-gray-400">
                            <li><code className="text-green-300">&lt;</code>, <code className="text-green-300">&gt;</code> : Numeric</li>
                            <li><code className="text-green-300">contains</code> : Partial match</li>
                        </ul>
                        <div className="mt-2 text-xs text-gray-500">
                            Ex: <code className="text-gray-300">[price &lt; 100]</code>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-bold text-white mb-2">Tips</h3>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        <li>Use <strong>#hashtags</strong> for general categorization.</li>
                        <li>Click <strong>Publish</strong> to save to Nostr.</li>
                        <li>Click <strong>Find Matches</strong> to search the network.</li>
                        <li>Enable <strong>Developer Mode</strong> in Settings for advanced tools.</li>
                    </ul>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-bold text-white mb-2">Keyboard Shortcuts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Command Palette</span>
                            <code className="text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs">Ctrl+K</code>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">New Note</span>
                            <code className="text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs">Ctrl+N</code>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Search Sidebar</span>
                            <code className="text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs">Ctrl+/</code>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Save Note</span>
                            <code className="text-gray-300 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-700 font-mono text-xs">Ctrl+S</code>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
