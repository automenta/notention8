import React, { useMemo, useState } from 'react';
import { finalizeEvent, nip19 } from 'nostr-tools';
import { useNostrProfile } from '../../hooks/useNostrProfile';
import type { Contact } from '../../types';
import { DEFAULT_RELAYS, formatNpub, hexToBytes, pool } from '../../utils/nostr';
import { UserPlusIcon, PlusIcon, SearchIcon, CpuChipIcon } from '../layout/icons';

interface ContactListProps {
  privkey: string;
  pubkey: string;
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
  isLoading: boolean;
}

export const ContactList: React.FC<ContactListProps> = ({
  privkey,
  pubkey,
  contacts,
  setContacts,
  selectedContact,
  onSelectContact,
  isLoading,
}) => {
  const [newContactNpub, setNewContactNpub] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const contactPubkeys = useMemo(
    () => contacts.map((c) => c.pubkey),
    [contacts]
  );
  const contactProfiles = useNostrProfile(contactPubkeys);

  const filteredContacts = useMemo(() => {
      if (!searchTerm) return contacts;
      return contacts.filter(c => {
          const profile = contactProfiles[c.pubkey];
          const name = profile?.name || '';
          return name.toLowerCase().includes(searchTerm.toLowerCase()) || c.pubkey.includes(searchTerm);
      });
  }, [contacts, searchTerm, contactProfiles]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!newContactNpub.trim()) return;

    try {
      const { type, data: newPubkey } = nip19.decode(newContactNpub.trim());
      if (type !== 'npub' || typeof newPubkey !== 'string')
        throw new Error('Invalid npub format.');

      if (contacts.some((c) => c.pubkey === newPubkey) || newPubkey === pubkey)
        throw new Error('Contact already exists or is yourself.');

      const currentTags = contacts.map((c) => ['p', c.pubkey]);
      const newTags = [...currentTags, ['p', newPubkey]];

      const event = finalizeEvent(
        {
          kind: 3,
          created_at: Math.floor(Date.now() / 1000),
          tags: newTags,
          content: '',
        },
        hexToBytes(privkey)
      );

      await Promise.all(pool.publish(DEFAULT_RELAYS, event));

      setContacts((c) => [...c, { pubkey: newPubkey }]);
      setNewContactNpub('');
      setIsAdding(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact.');
      console.error(err);
    }
  };

  return (
    <div className="h-full flex flex-col border-r border-gray-700/50 bg-gray-900/50">
      <div className="p-4 border-b border-gray-700/50 space-y-3">
        <h2 className="text-lg font-bold text-white flex justify-between items-center">
            Chats
            <button
                onClick={() => setIsAdding(!isAdding)}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                title="Add Contact"
            >
                <PlusIcon className="h-4 w-4" />
            </button>
        </h2>

        {isAdding && (
            <div className="animate-fade-in bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                <form onSubmit={handleAddContact} className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={newContactNpub}
                    onChange={(e) => setNewContactNpub(e.target.value)}
                    placeholder="npub..."
                    className="w-full p-2 text-sm bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                       <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="px-3 py-1 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-600 rounded text-white text-xs hover:bg-blue-700"
                      >
                        Add
                      </button>
                  </div>
                </form>
                {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
        )}

        <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search contacts..."
                className="w-full bg-gray-800 border border-gray-700 rounded-full py-1.5 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-gray-500 text-sm">
            Loading...
          </div>
        )}
        {!isLoading && contacts.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">
            <p className="mb-2">No contacts yet.</p>
            <p>Add someone via npub to start chatting.</p>
          </div>
        )}
        {filteredContacts.map((contact) => {
          const profile = contactProfiles[contact.pubkey];
          const isSelected = selectedContact?.pubkey === contact.pubkey;

          return (
            <div
              key={contact.pubkey}
              onClick={() => onSelectContact(contact)}
              className={`
                flex items-center gap-3 p-3 cursor-pointer transition-colors
                ${isSelected ? 'bg-blue-900/20 border-r-2 border-blue-500' : 'hover:bg-gray-800/50 border-r-2 border-transparent'}
              `}
            >
              <div className="relative">
                  <img
                    src={
                      profile?.picture ||
                      contact.picture ||
                      `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${contact.pubkey}`
                    }
                    className="h-10 w-10 rounded-full bg-gray-700 object-cover"
                  />
                  {contact.isAgent && (
                      <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-0.5 border border-gray-700" title="AI Agent">
                          <CpuChipIcon className="w-3 h-3 text-green-400" />
                      </div>
                  )}
              </div>
              <div className="overflow-hidden flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <p className={`font-semibold truncate text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {contact.name || profile?.name || (
                        (() => {
                            try {
                                return formatNpub(nip19.npubEncode(contact.pubkey));
                            } catch {
                                return contact.pubkey;
                            }
                        })()
                      )}
                    </p>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {contact.about || profile?.about || 'No bio available'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
