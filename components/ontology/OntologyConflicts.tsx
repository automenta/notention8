import React, { useMemo } from 'react';
import { ArrowRightIcon } from '../layout/icons';

interface Conflict {
    noteId: string;
    noteTitle: string;
    propertyKey: string;
    expectedType: string;
    actualValue: string;
    reason: string;
}

interface OntologyConflictsProps {
    conflicts: Conflict[];
    onSelectNote: (noteId: string) => void;
}

export const OntologyConflicts: React.FC<OntologyConflictsProps> = ({ conflicts, onSelectNote }) => {
    // Group conflicts by Note ID
    const groupedConflicts = useMemo(() => {
        const groups: Record<string, Conflict[]> = {};
        conflicts.forEach(c => {
            if (!groups[c.noteId]) {
                groups[c.noteId] = [];
            }
            groups[c.noteId].push(c);
        });
        return groups;
    }, [conflicts]);

    return (
        <div className="flex flex-col items-center justify-start h-full text-center text-gray-400 pt-4">
            {conflicts.length > 0 ? (
                <div className="w-full max-w-4xl space-y-6 pb-8">
                    <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-lg flex items-center gap-4 text-left">
                        <div className="text-3xl">⚠️</div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Conflicts Detected</h3>
                            <p className="text-sm text-gray-400">
                                Found {conflicts.length} issues across {Object.keys(groupedConflicts).length} notes.
                                These properties do not match the expected types defined in your Ontology.
                            </p>
                        </div>
                    </div>

                    {Object.entries(groupedConflicts).map(([noteId, noteConflicts]) => (
                        <div key={noteId} className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden text-left shadow-lg">
                            <div className="bg-gray-900/50 p-3 border-b border-gray-700 flex justify-between items-center">
                                <h4 className="font-bold text-white flex items-center gap-2">
                                    <span className="text-gray-500">Note:</span>
                                    {noteConflicts[0].noteTitle || 'Untitled Note'}
                                </h4>
                                <button
                                    onClick={() => onSelectNote(noteId)}
                                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded flex items-center gap-1 transition-colors"
                                >
                                    Edit Note <ArrowRightIcon className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="divide-y divide-gray-700/50">
                                {noteConflicts.map((conflict, idx) => (
                                    <div key={idx} className="p-4 flex items-start justify-between hover:bg-gray-700/20 transition-colors">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-sm text-red-400 bg-red-900/20 px-1.5 py-0.5 rounded">
                                                    [{conflict.propertyKey}]
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    expects <span className="text-blue-300 font-mono">{conflict.expectedType}</span>
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                Current value: <span className="text-yellow-300 font-mono bg-yellow-900/20 px-1.5 rounded">"{conflict.actualValue}"</span>
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-red-500 bg-red-900/10 px-2 py-1 rounded border border-red-900/30">
                                            {conflict.reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                     <div className="text-green-500 mb-4 text-5xl">✓</div>
                     <h3 className="text-xl font-bold text-white mb-2">No Conflicts</h3>
                     <p className="max-w-md">
                        All notes align perfectly with your Ontology.
                    </p>
                </div>
            )}
        </div>
    );
};
