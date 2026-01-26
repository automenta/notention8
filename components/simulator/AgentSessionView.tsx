import React from 'react';
import { TiptapEditor } from '../editor/TiptapEditor';
import type { Note } from '../../types';
import { useAgentSessionLogic } from '../../hooks/simulator/useAgentSessionLogic';

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
    <div className="flex flex-col h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg relative transition-colors duration-500">

      {/* Notifications Overlay */}
      {notifications.length > 0 && (
          <div className="absolute top-8 right-2 z-50 flex flex-col gap-1 pointer-events-none">
              {notifications.map((msg, i) => (
                  <div key={i} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] px-2 py-1 rounded shadow-lg animate-bounce border border-white/20">
                      🔔 {msg}
                  </div>
              ))}
          </div>
      )}

      {/* Header */}
      <div className={`bg-gray-800 px-2 flex justify-between items-center border-b border-gray-700 ${minimal ? 'py-1' : 'py-2'}`}>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'Error' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`font-bold text-gray-200 ${minimal ? 'text-xs' : 'text-sm'}`}>{agentName}</span>
        </div>
        <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
            {status === 'Typing...' && <span className="animate-pulse">⌨️</span>}
            {status}
        </span>
      </div>

      <div className="flex flex-grow overflow-hidden">
          {/* Mini Sidebar */}
          <div className="w-1/4 bg-gray-950 border-r border-gray-800 flex flex-col">
            <div className="p-1 border-b border-gray-800">
                <button
                    onClick={() => {
                        const n = addNote();
                        setActiveNote(n);
                    }}
                    className="w-full text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300 py-1 rounded transition-colors"
                >
                    + Note
                </button>
            </div>
            <div className="overflow-y-auto flex-1">
                {notes.map(note => (
                    <div
                        key={note.id}
                        onClick={() => setActiveNote(note)}
                        className={`p-1 cursor-pointer border-b border-gray-900 truncate text-[10px] transition-colors ${activeNote?.id === note.id ? 'bg-blue-900/30 text-blue-200' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {note.title || "Untitled"}
                    </div>
                ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="w-3/4 bg-gray-900 relative overflow-y-auto">
            {displayNote ? (
                <div className={`min-h-full ${minimal ? 'p-1' : 'p-4'}`}>
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
                <div className="flex items-center justify-center h-full text-gray-600 text-[10px]">
                    Initializing...
                </div>
            )}
          </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 px-2 py-0.5 text-[9px] text-gray-600 flex justify-between border-t border-gray-800">
        <span>{notes.length}</span>
        <span>{activeNote?.id.slice(0,4)}</span>
      </div>
    </div>
  );
};
