import React from 'react';
import { ContactList } from '../chat/ContactList';
import { ChatWindow } from '../chat/ChatWindow';
import { useChatView } from '../../hooks/useChatView';

export const ChatView: React.FC = () => {
  const {
    privkey,
    pubkey,
    localSelectedContact,
    contacts,
    setContacts,
    messages,
    isLoading,
    addMessage,
    handleSelectContact
  } = useChatView();

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
