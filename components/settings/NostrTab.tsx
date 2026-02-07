import React, { useMemo, useState } from 'react';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { bytesToHex, hexToBytes, DEFAULT_RELAYS } from '@/utils/nostr';
import { KeyIcon, UserPlusIcon, NetworkIcon, PlusIcon, TrashIcon } from '../icons';
import type { AppSettings } from '@/types';
import { CopyableField } from '../common/CopyableField';
import { usePublish } from '@/hooks/usePublish';
import { useToast } from '../contexts/ToastContext';

interface NostrTabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const NostrTab: React.FC<NostrTabProps> = ({
  settings,
  setSettings,
}) => {
  const { publishProfile, isPublishing } = usePublish();
  const { addToast } = useToast();

  // Local state for profile form
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [picture, setPicture] = useState('');

  // Local state for import
  const [importKey, setImportKey] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  // Local state for relays
  const [newRelay, setNewRelay] = useState('');

  const currentRelays = settings.nostr.relays || DEFAULT_RELAYS;

  const handleGenerateKeys = () => {
    const newPrivKeyHex = bytesToHex(generateSecretKey());
    setSettings((prev) => ({ ...prev, nostr: { ...prev.nostr, privkey: newPrivKeyHex } }));
    addToast('New keys generated', 'success');
  };

  const handleImportKey = () => {
      setImportError(null);
      const key = importKey.trim();
      if (!key) return;

      try {
          if (key.startsWith('nsec')) {
              const { type, data } = nip19.decode(key);
              if (type !== 'nsec') {
                  setImportError('Invalid key type. Must be an nsec.');
                  return;
              }
              const hex = bytesToHex(data as Uint8Array);
              setSettings((prev) => ({ ...prev, nostr: { ...prev.nostr, privkey: hex } }));
          } else {
              // Assume Hex
              if (!/^[0-9a-fA-F]{64}$/.test(key)) {
                  setImportError('Invalid hex private key. Must be 64 characters.');
                  return;
              }
              setSettings((prev) => ({ ...prev, nostr: { ...prev.nostr, privkey: key.toLowerCase() } }));
          }
          setImportKey('');
          addToast('Key imported successfully', 'success');
      } catch (e) {
          setImportError('Invalid key format.');
          console.error(e);
      }
  };

  const handleLogout = () => {
    if (
      window.confirm(
        'Are you sure? This will remove your Nostr private key from this device. This action cannot be undone.'
      )
    ) {
      setSettings((prev) => ({ ...prev, nostr: { ...prev.nostr, privkey: null } }));
        addToast('Logged out', 'info');
    }
  };

  const handleSaveProfile = async () => {
      try {
          await publishProfile({ name, about, picture });
          addToast('Profile published to network!', 'success');
      } catch (e: any) {
          addToast('Failed to publish profile: ' + e.message, 'error');
      }
  };

  const handleAddRelay = () => {
      if (!newRelay) return;
      let url = newRelay.trim();
      if (!url.startsWith('wss://') && !url.startsWith('ws://')) {
          url = 'wss://' + url;
      }

      if (currentRelays.includes(url)) {
          addToast('Relay already exists.', 'warning');
          return;
      }

      setSettings(prev => ({
          ...prev,
          nostr: {
              ...prev.nostr,
              relays: [...(prev.nostr.relays || DEFAULT_RELAYS), url]
          }
      }));
      setNewRelay('');
      addToast('Relay added', 'success');
  };

  const handleRemoveRelay = (url: string) => {
      if (confirm(`Remove relay ${url}?`)) {
          setSettings(prev => ({
              ...prev,
              nostr: {
                  ...prev.nostr,
                  relays: (prev.nostr.relays || DEFAULT_RELAYS).filter(r => r !== url)
              }
          }));
          addToast('Relay removed', 'info');
      }
  };

  const { npub, nsec } = useMemo(() => {
    if (!settings.nostr.privkey) return { npub: null, nsec: null };
    try {
      const pubkey = getPublicKey(hexToBytes(settings.nostr.privkey));
      return {
        npub: nip19.npubEncode(pubkey),
        nsec: nip19.nsecEncode(hexToBytes(settings.nostr.privkey)),
      };
    } catch (e) {
      console.error('Error encoding keys:', e);
      return { npub: 'Error', nsec: 'Error' };
    }
  }, [settings.nostr.privkey]);

  return (
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in space-y-8">

      {/* Identity Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
            <KeyIcon className="h-6 w-6 text-yellow-400" />
            Nostr Identity
        </h2>
        {settings.nostr.privkey && nsec && npub ? (
            <div className="space-y-4">
            <p className="text-sm text-gray-400">
                Your keys are stored locally on this device. Keep your private key
                safe and do not share it.
            </p>
            <CopyableField label="Public Key (npub)" value={npub} />
            <CopyableField label="Private Key (nsec)" value={nsec} isSecret />
            <button
                onClick={handleLogout}
                className="w-full mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
                <KeyIcon className="h-5 w-5" /> Log Out & Clear Private Key
            </button>
            </div>
        ) : (
            <div className="text-center py-6 space-y-6">
                <div className="space-y-2">
                    <p className="text-gray-400">
                        New to Nostr? Generate a fresh identity.
                    </p>
                    <button
                        onClick={handleGenerateKeys}
                        className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <KeyIcon className="h-5 w-5" /> Generate New Keys
                    </button>
                </div>

                <div className="border-t border-gray-700/50 w-1/2 mx-auto"></div>

                <div className="max-w-md mx-auto space-y-2">
                     <p className="text-gray-400 text-sm">
                        Already have an account? Import your private key.
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="password"
                            value={importKey}
                            onChange={(e) => setImportKey(e.target.value)}
                            placeholder="nsec1... or hex key"
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                        />
                        <button
                            onClick={handleImportKey}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium"
                        >
                            Import
                        </button>
                    </div>
                    {importError && (
                        <p className="text-red-400 text-xs text-left">{importError}</p>
                    )}
                </div>
            </div>
        )}
      </div>

       {/* Relay Management Section */}
       <div className="border-t border-gray-700 pt-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
                <NetworkIcon className="h-6 w-6 text-purple-400" />
                Network Relays
            </h2>
            <div className="space-y-4 max-w-lg">
                <p className="text-sm text-gray-400">
                    Manage the relays you connect to. These servers store and broadcast your notes.
                </p>

                <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                    {currentRelays.map((relay, idx) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-3 border-b border-gray-700 last:border-0 hover:bg-gray-750">
                            <span className="text-gray-300 text-sm font-mono truncate">{relay}</span>
                            <button
                                onClick={() => handleRemoveRelay(relay)}
                                className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                title="Remove Relay"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    {currentRelays.length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-sm italic">
                            No relays configured. Using defaults internally if not set.
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newRelay}
                        onChange={(e) => setNewRelay(e.target.value)}
                        placeholder="wss://relay.example.com"
                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddRelay()}
                    />
                    <button
                        onClick={handleAddRelay}
                        disabled={!newRelay}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                         <PlusIcon className="h-4 w-4" /> Add
                    </button>
                </div>
            </div>
       </div>

      {/* Profile Section */}
      {settings.nostr.privkey && (
          <div className="border-t border-gray-700 pt-6">
             <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-3">
                <UserPlusIcon className="h-6 w-6 text-blue-400" />
                Public Profile
            </h2>
            <div className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        placeholder="Alice"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">About</label>
                    <textarea
                        value={about}
                        onChange={e => setAbout(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none h-24"
                        placeholder="I'm a developer building cool things."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Picture URL</label>
                    <input
                        type="text"
                        value={picture}
                        onChange={e => setPicture(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        placeholder="https://example.com/avatar.png"
                    />
                </div>
                <button
                    onClick={handleSaveProfile}
                    disabled={isPublishing}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-50"
                >
                    {isPublishing ? 'Publishing...' : 'Publish Profile'}
                </button>
            </div>
          </div>
      )}

    </div>
  );
};
