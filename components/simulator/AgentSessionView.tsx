import React from 'react';
import { TiptapEditor } from '../editor/TiptapEditor';
import type { Note } from '../../types';
import { useAgentSessionLogic } from '../../hooks/simulator/useAgentSessionLogic';
import { PlusIcon, CpuChipIcon } from '../layout/icons';

interface Props {
  agentName: string;
  currentDraft: string;
  onDraftChange: (text: string) => void;
  status: string;
  onPublish: (note: Note) => void;
  notifications: string[];
  minimal?: boolean;
}

export const AgentSessionView: React.FC<Props> = ({
    agentName,
    currentDraft,
    onDraftChange,
    status,
    onPublish,
    notifications,
    minimal = false
}) => {
  const {
      notes,
      addNote,
      activeNote,
      setActiveNote,
      displayNote,
      settings
  } = useAgentSessionLogic({ status, onPublish, currentDraft });

  return (
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-sm relative transition-colors duration-500">

      {/* Notifications Overlay */}
      {notifications.length > 0 && (
          <div className="absolute top-10 right-4 z-50 flex flex-col gap-2 pointer-events-none">
              {notifications.map((msg, i) => (
                  <div key={i} className="bg-blue-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded shadow-lg animate-slide-in-up border border-blue-400/50 flex items-center gap-2">
                      <span>🔔</span> {msg}
                  </div>
              ))}
          </div>
      )}

      {/* Header */}
      <div className={`bg-gray-800 px-3 flex justify-between items-center border-b border-gray-700 ${minimal ? 'py-1.5' : 'py-2'}`}>
        <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${status === 'Error' ? 'bg-red-500 shadow-red-500/50' : 'bg-green-500 shadow-green-500/50'}`}></div>
            <span className={`font-bold text-gray-200 tracking-wide ${minimal ? 'text-xs' : 'text-sm'}`}>{agentName}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1.5 bg-gray-900/50 px-2 py-0.5 rounded border border-gray-700/50">
            {status === 'Typing...' && <span className="animate-pulse">⌨️</span>}
            <span className="uppercase tracking-wider">{status}</span>
        </span>
      </div>

      <div className="flex flex-grow overflow-hidden">
          {/* Mini Sidebar */}
          <div className="w-48 bg-gray-950 border-r border-gray-800 flex flex-col flex-shrink-0">
            <div className="p-2 border-b border-gray-800">
                <button
                    onClick={() => {
                        const n = addNote();
                        setActiveNote(n);
                    }}
                    className="w-full text-xs font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-1.5 rounded transition-colors border border-gray-700 hover:border-gray-600 flex items-center justify-center gap-1.5"
                >
                    <PlusIcon className="w-3 h-3" />
                    New Note
                </button>
            </div>
            <div className="overflow-y-auto flex-1 p-1 space-y-0.5 custom-scrollbar">
                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className={`px-2 py-1.5 cursor-pointer rounded truncate text-[10px] transition-all border border-transparent ${
                            activeNote?.id === note.id
                            ? 'bg-blue-900/20 text-blue-200 border-blue-900/30'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900'
                        }`}
                    >
                        {note.title || "Untitled Note"}
                    </div>
                ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 bg-gray-900 relative overflow-y-auto custom-scrollbar flex flex-col">
            {displayNote ? (
                <div className={`flex-1 ${minimal ? 'p-2' : 'p-4'}`}>
                    <TiptapEditor
                        note={displayNote}
                        onSave={(content) => {
                            onDraftChange(content);
                        }}
                        ontology={settings.ontology}
                        minimal={minimal}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-600 flex-col gap-2">
                    <CpuChipIcon className="w-8 h-8 opacity-20" />
                    <span className="text-xs italic">Initializing agent session...</span>
                </div>
            )}
          </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 px-3 py-1 text-[9px] text-gray-600 flex justify-between border-t border-gray-800 font-mono">
        <span>{notes.length} Notes</span>
        <span>ID: {activeNote?.id.slice(0,8)}...</span>
      </div>
    </div>
  );
};
