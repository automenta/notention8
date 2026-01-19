import React from 'react';

import { useSettingsView } from '../../hooks/useSettingsView';
import { Toggle } from '../common/Toggle';
import { AITab } from '../settings/AITab';
import { DataTab } from '../settings/DataTab';
import { NostrTab } from '../settings/NostrTab';
import { OntologyTab } from '../settings/OntologyTab';
// SimulatorView removed from Settings tabs to be a top-level view

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ label, isActive, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive
          ? 'bg-blue-600 text-white shadow-sm'
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );
}

export function SettingsView() {
  const {
    settings,
    setSettings,
    activeTab,
    setActiveTab,
    toggleDeveloperMode,
  } = useSettingsView();

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-gray-700 pb-4">
        <div>
            <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
            <p className="text-gray-400 text-sm">Manage your preferences and data.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700/50">
              <span className="text-gray-400 text-xs uppercase tracking-wider font-bold">
                Dev Mode
              </span>
              <Toggle
                checked={settings.developerMode}
                onChange={toggleDeveloperMode}
                ariaLabel="Toggle Developer Mode"
              />
            </div>
        </div>
      </div>

      <div className="flex-shrink-0 mb-6 overflow-x-auto">
        <nav className="flex space-x-1 bg-gray-900/50 p-1 rounded-lg inline-flex min-w-max" aria-label="Tabs">
          <TabButton
            label="🤖 AI Assistant"
            isActive={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
          <TabButton
            label="🔑 Network & Keys"
            isActive={activeTab === 'nostr'}
            onClick={() => setActiveTab('nostr')}
          />
          <TabButton
            label="📦 Data Management"
            isActive={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
          />
          {settings.developerMode && (
            <>
              <TabButton
                label="🧬 Ontology Graph"
                isActive={activeTab === 'ontology'}
                onClick={() => setActiveTab('ontology')}
              />
            </>
          )}
        </nav>
      </div>

      <div className="flex-grow">
        {activeTab === 'ai' && (
          <AITab settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'nostr' && (
          <NostrTab settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'data' && <DataTab />}
        {activeTab === 'ontology' && settings.developerMode && <OntologyTab />}
      </div>
    </div>
  );
}
