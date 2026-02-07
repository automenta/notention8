import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: string) => void;
  initialValue?: string;
}

export const MapPickerModal: React.FC<MapPickerModalProps> = ({
  isOpen,
  onClose,
  onLocationSelect,
  initialValue,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<L.LatLng | null>(null);

  const initialLatLng = useMemo(() => {
    if (initialValue) {
      const [lat, lng] = initialValue.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lng)) {
        return new L.LatLng(lat, lng);
      }
    }
    return null;
  }, [initialValue]);

  useEffect(() => {
    if (isOpen && mapContainerRef.current) {
      if (!mapRef.current) {
        const map = L.map(mapContainerRef.current);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
        mapRef.current = map;

        map.on('click', (e: L.LeafletMouseEvent) => {
          setSelectedCoords(e.latlng);
        });
      }

      const map = mapRef.current;
      // Use a timeout to ensure the map container is visible and has its final size.
      setTimeout(() => {
        map.invalidateSize();
        const viewCoords = initialLatLng || new L.LatLng(20, 0);
        const zoom = initialLatLng ? 13 : 2;
        map.setView(viewCoords, zoom);

        if (initialLatLng) {
          setSelectedCoords(initialLatLng);
        } else {
          setSelectedCoords(null);
          if (markerRef.current) {
            markerRef.current.remove();
            markerRef.current = null;
          }
        }
      }, 100);
    }
  }, [isOpen, initialLatLng]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && selectedCoords) {
      if (!markerRef.current) {
        markerRef.current = L.marker(selectedCoords).addTo(map);
      } else {
        markerRef.current.setLatLng(selectedCoords);
      }
      map.panTo(selectedCoords);
    }
  }, [selectedCoords]);

  const handleSave = () => {
    if (selectedCoords) {
      onLocationSelect(
        `${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`
      );
    }
    onClose();
  };

  return (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select a Location"
        className="max-w-4xl h-[80vh]"
    >
        <p className="text-sm text-gray-400 mb-2 flex-shrink-0">
          Click on the map to place a pin.
        </p>
        <div ref={mapContainerRef} className="flex-grow w-full rounded-md bg-gray-900" />
        <div className="flex justify-end items-center gap-4 mt-4 flex-shrink-0">
          {selectedCoords && (
            <p className="text-sm text-gray-300 font-mono bg-gray-700 px-3 py-1.5 rounded-md">
              {selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)}
            </p>
          )}
          <Button
            onClick={onClose}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedCoords}
            onClick={handleSave}
            variant="primary"
          >
            Save Location
          </Button>
        </div>
    </Modal>
  );
};
