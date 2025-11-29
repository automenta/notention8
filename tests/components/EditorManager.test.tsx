import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorManager } from '../../components/EditorManager';
import type { Note } from '../../types';

// Mock TiptapEditor
vi.mock('../../components/TiptapEditor', () => ({
  TiptapEditor: () => <div data-testid="mock-editor">Editor</div>,
}));

// Mock usePublish
const mockPublishNote = vi.fn();
vi.mock('../../hooks/usePublish', () => ({
  usePublish: () => ({
    publishNote: mockPublishNote,
    isPublishing: false,
  }),
}));

describe('EditorManager', () => {
  const mockOnSave = vi.fn();
  const initialNote: Note = {
    id: '123',
    title: 'Original Title',
    content: '<p>Content</p>',
    tags: [],
    properties: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnSave.mockClear();
    mockPublishNote.mockClear();
    // Mock window.confirm and alert
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('updates title and saves after debounce when user types', () => {
    render(<EditorManager note={initialNote} onSave={mockOnSave} />);
    const titleInput = screen.getByPlaceholderText('Note Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Original Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    expect(titleInput.value).toBe('New Title');
    expect(mockOnSave).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      title: 'New Title',
    }));
  });

  it('calls publishNote when publish button is clicked', async () => {
    mockPublishNote.mockResolvedValue('event-id-123');

    render(<EditorManager note={initialNote} onSave={mockOnSave} />);

    const publishBtn = screen.getByTitle('Publish to Nostr');

    await act(async () => {
        fireEvent.click(publishBtn);
    });

    expect(window.confirm).toHaveBeenCalled();
    expect(mockPublishNote).toHaveBeenCalledWith(expect.objectContaining({
        id: '123'
    }));

    // onSave called immediately with updated note
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
        nostrEventId: 'event-id-123'
    }));
  });
});
