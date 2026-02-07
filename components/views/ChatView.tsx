import React, { useEffect, useMemo, useState } from 'react';
import { getPublicKey } from 'nostr-tools';
import type { Contact } from '../../types';
import { hexToBytes } from '../../utils/nostr';
import { ContactList } from '../chat/ContactList';
import { ChatWindow } from '../chat/ChatWindow';
import { useSettings } from '../../hooks/useSettingsContext';
import { useView } from '../../hooks/useViewContext';
import { useChat } from '../../hooks/useChat';

export const ChatView: React.FC = () => {
  const { settings } = useSettings();
  const { selectedChatPubkey, setSelectedChatPubkey } = useView();

  const privkey = settings.nostr.privkey;
  const pubkey = useMemo(
    () => (privkey ? getPublicKey(hexToBytes(privkey)) : null),
    [privkey]
  );

  // Sync selected contact with ViewContext
  const [localSelectedContact, setLocalSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
      if (selectedChatPubkey) {
          setLocalSelectedContact({ pubkey: selectedChatPubkey });
      } else {
          setLocalSelectedContact(null);
      }
  }, [selectedChatPubkey]);

  const handleSelectContact = (contact: Contact | null) => {
      setSelectedChatPubkey(contact ? contact.pubkey : null);
  };

  const {
      contacts,
      setContacts,
      messages,
      isLoading,
      addMessage
  } = useChat({ privkey, pubkey, selectedContact: localSelectedContact });

  if (!privkey || !pubkey) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-gray-400">
          Chat Requires Nostr Account
        </h2>
        <p className="text-gray-500 mt-2">
          Please create or configure your Nostr account in the
          &quot;Network&quot; tab.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-800/50 rounded-lg overflow-hidden">
      <div
        className={`w-full md:w-1/3 md:flex-shrink-0 ${localSelectedContact ? 'hidden md:block' : 'block'}`}
      >
        <ContactList
          privkey={privkey}
          pubkey={pubkey}
          contacts={contacts}
          setContacts={setContacts}
          selectedContact={localSelectedContact}
          onSelectContact={handleSelectContact}
          isLoading={isLoading}
        />
      </div>
      <div
        className={`w-full ${!localSelectedContact ? 'hidden md:block' : 'block'}`}
      >
        <ChatWindow
          privkey={privkey}
          pubkey={pubkey}
          selectedContact={localSelectedContact}
          onBack={() => handleSelectContact(null)}
          messages={
            localSelectedContact ? messages[localSelectedContact.pubkey] || [] : []
          }
          onSendMessage={(peerPubkey, event, decryptedContent) =>
            addMessage(peerPubkey, event, decryptedContent)
          }
        />
      </div>
    </div>
  );
};
