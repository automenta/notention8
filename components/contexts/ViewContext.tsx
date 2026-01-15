import React, { createContext, ReactNode, useState } from 'react';
import { useLocalForage } from '../../hooks/useLocalForage';
import type { View, SortOrder } from '../../types';

interface ViewContextType {
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  activeView: View;
  setActiveView: (view: View) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  matchingNoteId: string | null;
  setMatchingNoteId: (id: string | null) => void;
  selectedChatPubkey: string | null;
  setSelectedChatPubkey: (pubkey: string | null) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  notificationCount: number;
  matches: MatchResult[];
  addMatch: (match: MatchResult) => void;
  clearNotifications: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface MatchResult {
  localNoteId: string;
  event: any; // NostrEvent
  score: number;
  timestamp: number;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sortOrder, setSortOrder] = useLocalForage<SortOrder>(
    'notention-sort-order',
    'updatedAt_desc'
  );
  const [activeView, setActiveView] = useState<View>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [matchingNoteId, setMatchingNoteId] = useState<string | null>(null);
  const [selectedChatPubkey, setSelectedChatPubkey] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const lastToastTimeRef = React.useRef(0);

  const notificationCount = matches.length;

  const showToast = (msg: string) => {
      const now = Date.now();
      // Simple debounce/throttle: only one toast every 3 seconds
      if (now - lastToastTimeRef.current < 3000) return;

      lastToastTimeRef.current = now;
      setToast(msg);
      setTimeout(() => setToast(null), 3000);
  };

  const addMatch = (match: MatchResult) => {
      setMatches(prev => {
          // Avoid duplicates
          if (prev.some(m => m.event.id === match.event.id && m.localNoteId === match.localNoteId)) {
              return prev;
          }
          return [match, ...prev];
      });
  };

  const clearNotifications = () => {
      // We might want to keep matches but clear the "count" badge?
      // For MVP, let's just assume viewing them clears them or we don't clear them.
      // But the interface needs to exist.
      // Let's implement specific clearing later if needed, for now no-op or clear all?
      // Actually, if we clear matches, we lose the list.
      // Let's just reset the list for now if the user wants to "clear" them.
      // Better: we don't clear them, the badge shows total matches.
      // But the prompt says "alerting users".
  };

  return (
    <ViewContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedNoteId,
        setSelectedNoteId,
        matchingNoteId,
        setMatchingNoteId,
        selectedChatPubkey,
        setSelectedChatPubkey,
        toast,
        showToast,
        notificationCount,
        matches,
        addMatch,
        clearNotifications,
        searchTerm,
        setSearchTerm,
        sortOrder,
        setSortOrder
      }}
    >
      {children}
    </ViewContext.Provider>
  );
};

export { ViewContext };
