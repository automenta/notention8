import React from 'react';
import { AITab } from '../settings/AITab';
import { NostrTab } from '../settings/NostrTab';
import { DataTab } from '../settings/DataTab';
import { OntologyTab } from '../settings/OntologyTab';
import { Toggle } from '../common/Toggle';
import { SimulatorView } from '../simulator/SimulatorView';
import { useSettingsView } from '../../hooks/useSettingsView';

const TabButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? 'border-blue-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
    }`}
  >
    {label}
  </button>
);

export const SettingsView: React.FC = () => {
  const {
    settings,
    setSettings,
    activeTab,
    setActiveTab,
    toggleDeveloperMode,
  } = useSettingsView();

  return (
    <div className="p-8 h-full overflow-y-auto bg-gray-800/50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">⚙️ Settings</h1>
          <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">Developer Mode</span>
              <Toggle
                  checked={settings.developerMode}
                  onChange={toggleDeveloperMode}
                  ariaLabel="Toggle Developer Mode"
              />
          </div>
      </div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
          <TabButton
            label="🤖 AI"
            isActive={activeTab === 'ai'}
            onClick={() => setActiveTab('ai')}
          />
          <TabButton
            label="🔑 Nostr"
            isActive={activeTab === 'nostr'}
            onClick={() => setActiveTab('nostr')}
          />
          <TabButton
            label="📦 Data"
            isActive={activeTab === 'data'}
            onClick={() => setActiveTab('data')}
          />
          {settings.developerMode && (
            <>
                <TabButton
                  label="🧬 Ontology"
                  isActive={activeTab === 'ontology'}
                  onClick={() => setActiveTab('ontology')}
                />
                <TabButton
                  label="🧪 Simulator"
                  isActive={activeTab === 'simulator'}
                  onClick={() => setActiveTab('simulator')}
                />
            </>
          )}
        </nav>
      </div>

      <div className="h-[calc(100%-120px)]">
        {activeTab === 'ai' && (
          <AITab settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'nostr' && (
          <NostrTab settings={settings} setSettings={setSettings} />
        )}
        {activeTab === 'data' && <DataTab />}
        {activeTab === 'ontology' && settings.developerMode && <OntologyTab />}
        {activeTab === 'simulator' && settings.developerMode && <SimulatorView />}
      </div>
    </div>
  );
};
