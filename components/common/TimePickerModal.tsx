import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { format, isValid, parseISO } from 'date-fns';
import { useToast } from '../contexts/ToastContext';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (isoString: string) => void;
  initialValue?: string;
  title?: string;
}

export function TimePickerModal({
    isOpen,
    onClose,
    onTimeSelect,
    initialValue,
    title = "Pick Date & Time"
}: TimePickerModalProps) {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            let d = new Date();
            if (initialValue) {
                const parsed = parseISO(initialValue);
                if (isValid(parsed)) {
                    d = parsed;
                }
            }
            setDate(format(d, 'yyyy-MM-dd'));
            setTime(format(d, 'HH:mm'));
        }
    }, [isOpen, initialValue]);

    const handleSave = () => {
        try {
            const dateTimeString = `${date}T${time}`;
            const dt = new Date(dateTimeString);

            if (isValid(dt)) {
                // Return ISO string without milliseconds for cleaner display
                // Or just the string the user built if we want to be loose
                // Let's use standard ISO format
                onTimeSelect(`${date}T${time}:00`);
                onClose();
            } else {
                addToast("Invalid date/time combination", "error");
            }
        } catch (e: unknown) {
            console.error(e);
            addToast("Error constructing date", "error");
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                    <input
                        type="date"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        autoFocus
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                     <input
                        type="time"
                        className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                        value={time}
                        onChange={e => setTime(e.target.value)}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded transition-colors shadow-lg shadow-blue-900/20"
                    >
                        Set Time
                    </button>
                </div>
            </div>
        </Modal>
    );
}
