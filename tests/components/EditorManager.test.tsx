import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EditorManager } from '../../components/EditorManager';
import type { Note } from '../../types';

// Mock TiptapEditor to avoid Tiptap environment issues and focus on EditorManager logic
vi.mock('../../components/TiptapEditor', () => ({
  TiptapEditor: () => <div data-testid="mock-editor">Editor</div>,
}));

describe('EditorManager - Title Verification', () => {
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('updates title and saves after debounce when user types', () => {
    render(<EditorManager note={initialNote} onSave={mockOnSave} />);

    const titleInput = screen.getByPlaceholderText('Note Title') as HTMLInputElement;

    // Initial state
    expect(titleInput.value).toBe('Original Title');

    // Simulate typing
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    // State should update immediately
    expect(titleInput.value).toBe('New Title');

    // onSave should NOT be called yet (debounce)
    expect(mockOnSave).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // onSave should be called now
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      id: '123',
      title: 'New Title',
      content: '<p>Content</p>',
    }));
  });
});
