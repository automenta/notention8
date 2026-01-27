import React from 'react';
import type { Note } from '@notention/core';

interface PrivacyConfirmProps {
  note: Note;
  destination: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function PrivacyConfirmModal({
  note,
  destination,
  onConfirm,
  onCancel
}: PrivacyConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full border border-gray-700">
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>⚠️</span> Privacy Warning
          </h3>

          <p className="text-gray-300 mb-4">
            "<strong>{note.title}</strong>" is currently <strong>private</strong>.
          </p>

          <p className="text-gray-300 mb-2">Making it <strong>public</strong> will allow:</p>
          <ul className="list-disc list-inside text-gray-400 mb-6 space-y-1">
            <li>Publishing to {destination}</li>
            <li>Discovery by other users</li>
            <li>Permanent visibility on P2P network</li>
          </ul>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600 transition-colors"
            >
              Keep Private
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-500 transition-colors font-medium"
            >
              Make Public & Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
