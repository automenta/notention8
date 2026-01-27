import React from 'react';
import type { Note } from '@notention/core';
import { NoteIcon, GlobeIcon, DownloadIcon } from '../common/icons';

interface NoteGridItemProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}

export function NoteGridItem({ note, isSelected, onSelect }: NoteGridItemProps) {
  const opacity = (note.priority ?? 1.0) < 0.5 ? 0.5 : 1.0;
  const isLowPriority = (note.priority ?? 1.0) < 0.3;
  const borderStyle = isLowPriority ? 'dashed' : 'solid';
  const isPublic = note.public;

  // Dynamic border color based on public/private and selection
  let borderColor = 'border-gray-700/50';
  if (isSelected) {
      borderColor = 'border-blue-500/50';
  } else if (isPublic) {
      borderColor = 'border-green-600/50';
  }

  return (
    <div
      onClick={onSelect}
      className={`
        aspect-square flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer transition-colors border relative
        ${isSelected ? 'bg-blue-900/30 text-blue-100' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}
        ${borderColor}
      `}
      style={{ opacity, borderStyle }}
      title={note.title}
    >
      <div className="absolute top-1 right-1 flex gap-1">
         {note.source?.type === 'skill' && <DownloadIcon className="w-3 h-3 text-cyan-500" title="Imported by Skill" />}
         {note.source?.type === 'import' && <DownloadIcon className="w-3 h-3 text-purple-500" title="Imported" />}
         {isPublic && <GlobeIcon className="w-3 h-3 text-green-500" title="Public Note" />}
      </div>

      <NoteIcon className="h-8 w-8 mb-2 opacity-50" />
      <span className="text-xs text-center line-clamp-2 leading-tight break-words w-full">
        {note.title || 'Untitled'}
      </span>
      {isLowPriority && (
          <span className="absolute bottom-1 px-1 py-0.5 text-[0.6rem] bg-gray-900/80 rounded text-gray-500">Low Pri</span>
      )}
    </div>
  );
};
