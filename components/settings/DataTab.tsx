import React, { useRef } from 'react';
import { TrashIcon, DocumentDuplicateIcon, ArrowDownIcon, ArrowUpIcon } from '../layout/icons';
import { useNotes } from '../../hooks/useNotes';
import { useSettings } from '../../hooks/useSettingsContext';
import { useToast } from '../../hooks/useToast';
import localforage from 'localforage';
import type { Note } from '../../types';
import { Button } from '../common/Button';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { useState } from 'react';

export const DataTab: React.FC = () => {
  const { notes } = useNotes();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = async () => {
      // Create a JSON object with notes and settings
      // We should probably read directly from localforage to be safe, but state is source of truth too.
      // Let's rely on state since it's what the user sees.

      const exportData = {
          version: 1,
          timestamp: new Date().toISOString(),
          notes,
          settings
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notention-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      addToast('Data exported successfully', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const text = event.target?.result as string;
              const data = JSON.parse(text);

              // Case 1: Full Backup (notes + settings)
              if (data.notes && data.settings) {
                  if (confirm(`Found backup with ${data.notes.length} notes. This will OVERWRITE your current data. Continue?`)) {
                      await localforage.setItem('notention-notes', data.notes);
                      await localforage.setItem('notention-settings', data.settings);
                      addToast("Import successful! Reloading...", "success");
                      setTimeout(() => window.location.reload(), 1500);
                  }
                  return;
              }

              // Case 2: Single Note
              if (data.id && data.content) {
                  const currentNotes = await localforage.getItem<Note[]>('notention-notes') || [];
                  const existingIndex = currentNotes.findIndex((n) => n.id === data.id);

                  if (existingIndex >= 0) {
                      if (!confirm(`Note "${data.title}" already exists. Overwrite?`)) return;
                      currentNotes[existingIndex] = data;
                  } else {
                      currentNotes.push(data);
                  }

                  await localforage.setItem('notention-notes', currentNotes);
                  addToast(`Imported note: ${data.title}`, "success");
                  setTimeout(() => window.location.reload(), 1000); // Reload to refresh state
                  return;
              }

              throw new Error("Unknown file format. Expected a backup or a note.");
          } catch (err: unknown) {
              const message = err instanceof Error ? err.message : String(err);
              addToast("Import failed: " + message, 'error', 5000);
          }
      };
      reader.readAsText(file);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in space-y-8">

      {/* Backup & Restore */}
      <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
            <DocumentDuplicateIcon className="h-6 w-6 text-blue-400" />
            Backup & Restore
          </h2>
          <div className="flex gap-4">
              <Button
                onClick={handleExport}
                variant="primary"
                icon={ArrowDownIcon}
              >
                  Export Data (JSON)
              </Button>

              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="secondary"
                icon={ArrowUpIcon}
              >
                  Import Data (JSON)
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleImport}
              />
          </div>
          <p className="text-sm text-gray-400 mt-2">
              Save your notes and settings to a JSON file. You can restore them later on any device.
          </p>
      </div>

      <div className="border-t border-gray-700 pt-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
            <TrashIcon className="h-6 w-6 text-red-400" />
            Danger Zone
        </h2>
        <p className="text-sm text-gray-400 mb-4">
            Your notes and settings are stored locally in your browser&apos;s
            IndexedDB. Clearing data is irreversible.
        </p>
        <Button
            variant="danger"
            icon={TrashIcon}
            onClick={() => setShowClearConfirm(true)}
        >
            Clear All Local Data
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
            window.localStorage.clear();
            window.indexedDB.deleteDatabase('localforage');
            window.location.reload();
        }}
        title="Clear All Data?"
        message="Are you sure you want to delete all data? This action cannot be undone."
        confirmLabel="Clear Everything"
        isDestructive
      />
    </div>
  );
};
