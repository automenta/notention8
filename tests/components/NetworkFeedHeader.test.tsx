import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { NetworkFeedHeader } from '../../components/network/NetworkFeedHeader';

describe('NetworkFeedHeader', () => {
    const mockSetFilter = vi.fn();
    const mockSetIntentFilter = vi.fn();
    const mockOnClearMatch = vi.fn();

    const defaultProps = {
        filter: '',
        setFilter: mockSetFilter,
        sortedEvents: [],
        onClearMatch: mockOnClearMatch,
        intentFilter: 'all' as const,
        setIntentFilter: mockSetIntentFilter
    };

    it('renders intent filter buttons', () => {
        render(<NetworkFeedHeader {...defaultProps} />);

        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('Requests')).toBeInTheDocument();
        expect(screen.getByText('Offers')).toBeInTheDocument();
    });

    it('calls setIntentFilter when a filter button is clicked', () => {
        render(<NetworkFeedHeader {...defaultProps} />);

        fireEvent.click(screen.getByText('Requests'));
        expect(mockSetIntentFilter).toHaveBeenCalledWith('request');

        fireEvent.click(screen.getByText('Offers'));
        expect(mockSetIntentFilter).toHaveBeenCalledWith('offer');
    });

    it('updates search input', () => {
        render(<NetworkFeedHeader {...defaultProps} />);

        const input = screen.getByPlaceholderText('Search notes...');
        fireEvent.change(input, { target: { value: 'test' } });
        expect(mockSetFilter).toHaveBeenCalledWith('test');
    });
});
