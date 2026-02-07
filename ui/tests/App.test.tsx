import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';
import { NotesProvider } from '../components/contexts/NotesContext';
import { SettingsProvider } from '../components/contexts/SettingsContext';
import { ToastProvider } from '../components/contexts/ToastProvider';
import { ViewProvider } from '../components/contexts/ViewContext';
import { AgentProvider } from '../components/contexts/AgentContext';

// Mock the hooks
vi.mock('../hooks/useNotes', () => ({
  useNotes: () => ({
    notes: [],
    addNote: vi.fn(),
    deleteNote: vi.fn(),
    notesLoading: false,
  }),
}));

vi.mock('../hooks/useViewContext', () => ({
  useView: () => ({
    activeView: 'notes',
    setActiveView: vi.fn(),
    selectedNoteId: null,
    setSelectedNoteId: vi.fn(),
    searchTerm: '',
    sortOrder: 'updatedAt_desc',
  }),
}));

describe('App component', () => {
  it('should render without crashing', () => {
    expect(() =>
      render(
        <ToastProvider>
          <SettingsProvider>
            <NotesProvider>
              <ViewProvider>
                <AgentProvider>
                  <App />
                </AgentProvider>
              </ViewProvider>
            </NotesProvider>
          </SettingsProvider>
        </ToastProvider>
      )
    ).not.toThrow();
  });
});
