import React, { useMemo, useState } from 'react';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@/utils/nostr';
import { KeyIcon, UserPlusIcon } from '../icons';
import type { AppSettings } from '@/types';
import { CopyableField } from '../common/CopyableField';
import { usePublish } from '@/hooks/usePublish';

interface NostrTabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

export const NostrTab: React.FC<NostrTabProps> = ({
  settings,
  setSettings,
}) => {
  const { publishProfile, isPublishing } = usePublish();

  // Local state for profile form
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [picture, setPicture] = useState('');

  const handleGenerateKeys = () => {
    const newPrivKeyHex = bytesToHex(generateSecretKey());
    setSettings((prev) => ({ ...prev, nostr: { privkey: newPrivKeyHex } }));
  };

  const handleLogout = () => {
    if (
      window.confirm(
        'Are you sure? This will remove your Nostr private key from this device. This action cannot be undone.'
      )
    ) {
      setSettings((prev) => ({ ...prev, nostr: { privkey: null } }));
    }
  };

  const handleSaveProfile = async () => {
      try {
          await publishProfile({ name, about, picture });
          alert('Profile published to network!');
      } catch (e: any) {
          alert('Failed to publish profile: ' + e.message);
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
            <div className="text-center py-6">
            <p className="text-gray-400 mb-4">
                You don&apos;t have a Nostr identity set up on this device yet.
            </p>
            <button
                onClick={handleGenerateKeys}
                className="flex items-center justify-center gap-3 mx-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
                <KeyIcon className="h-5 w-5" /> Generate New Keys
            </button>
            </div>
        )}
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
