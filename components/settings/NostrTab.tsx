import React, { useMemo, useState } from 'react';
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';
import { bytesToHex, hexToBytes } from '@/utils/nostr';
import { ClipboardIcon, KeyIcon } from '../icons';
import type { AppSettings } from '@/types';

interface NostrTabProps {
  settings: AppSettings;
  setSettings: (updater: (settings: AppSettings) => AppSettings) => void;
}

const CopyableField: React.FC<{
  label: string;
  value: string;
  isSecret?: boolean;
}> = ({ label, value, isSecret = false }) => {
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(!isSecret);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type={visible ? 'text' : 'password'}
          readOnly
          value={value}
          className="flex-grow p-2 bg-gray-800 rounded-md text-gray-300 font-mono text-xs focus:outline-none"
        />
        {isSecret && (
          <button
            onClick={() => setVisible(!visible)}
            className="p-2 text-gray-400 hover:text-white rounded-md text-xs bg-gray-700 hover:bg-gray-600"
          >
            {visible ? 'Hide' : 'Show'}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-600 rounded-md hover:bg-gray-500"
          title="Copy to clipboard"
        >
          <ClipboardIcon className="h-4 w-4" />
        </button>
      </div>
      {copied && (
        <p className="text-xs text-green-400 mt-1">Copied to clipboard!</p>
      )}
    </div>
  );
};

export const NostrTab: React.FC<NostrTabProps> = ({ settings, setSettings }) => {
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
    <div className="bg-gray-900/70 p-6 rounded-lg animate-fade-in">
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
        <div className="text-center">
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
  );
};
