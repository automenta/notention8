import React, { useState, useEffect } from 'react';
import {
  CheckIcon,
  XIcon,
  MapPinIcon,
  ClockIcon,
  InformationCircleIcon
} from '../layout/icons';
import type { OntologyNode } from '../../types';
import { getCurrentPosition } from '../../utils/geolocation';
import { useToast } from '../contexts/ToastContext';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { IconButton } from '../common/IconButton';

interface PropertyFormProps {
  initialKey: string;
  initialOp: string;
  initialValue: string;
  isAdding: boolean;
  onSave: (key: string, op: string, value: string) => void;
  onCancel: () => void;
  onPickLocation?: () => void;
  onPickTime?: (key: string) => void;
  ontology: OntologyNode[];
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialKey,
  initialOp,
  initialValue,
  isAdding,
  onSave,
  onCancel,
  onPickLocation,
  onPickTime,
  ontology
}) => {
  const [key, setKey] = useState(initialKey);
  const [op, setOp] = useState(initialOp);
  const [value, setValue] = useState(initialValue);
  const { addToast } = useToast();

  // Update state if props change (e.g. location picked from parent)
  useEffect(() => {
    setKey(initialKey);
    setOp(initialOp);
    setValue(initialValue);
  }, [initialKey, initialOp, initialValue]);

  const getAttributeDetails = (k: string, nodes: OntologyNode[]): { type: string, description?: string } | undefined => {
      if (!nodes) return undefined;
      for (const node of nodes) {
        if (node.attributes && node.attributes[k]) {
          return { type: node.attributes[k].type, description: node.attributes[k].description };
        }
        if (node.children) {
          const found = getAttributeDetails(k, node.children);
          if (found) return found;
        }
      }
      return undefined;
  };

  const handleUseCurrentLocation = async () => {
      try {
          const pos = await getCurrentPosition();
          setValue(`${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
          if (!key) setKey('location');
          addToast('Current location fetched', 'success');
      } catch (e) {
          addToast('Failed to get location: ' + (e instanceof Error ? e.message : String(e)), 'error');
      }
  };

  const currentAttr = key ? getAttributeDetails(key, ontology) : undefined;
  const type = currentAttr?.type;
  const description = currentAttr?.description;
  const isTemporal = type === 'date' || type === 'datetime' || ['start', 'end', 'date', 'time', 'deadline', 'dueDate', 'startDateTime', 'endDateTime'].some(k => key.toLowerCase().includes(k.toLowerCase()));

  const handleSave = () => {
      onSave(key, op, value);
  };

  return (
    <div className="bg-gray-800 p-3 rounded-md border border-blue-500/50 space-y-3 animate-fade-in shadow-lg">
      <div className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1 flex justify-between items-center flex-wrap gap-1">
        <span>{isAdding ? 'New Property' : 'Edit Property'}</span>
        <div className="flex gap-1">
          {onPickLocation && (isAdding || ['location', 'geo', 'place'].includes(key)) && (
              <div className="flex gap-1">
                  <Button
                      onClick={handleUseCurrentLocation}
                      variant="secondary"
                      size="xs"
                      icon={MapPinIcon}
                      title="Use current location"
                  >
                      GPS
                  </Button>
                  <Button
                      onClick={() => {
                          if (isAdding && !key) setKey('location');
                          onPickLocation();
                      }}
                      variant="secondary"
                      size="xs"
                      icon={MapPinIcon}
                      title="Pick location on map"
                  >
                      Map
                  </Button>
              </div>
          )}
          {onPickTime && (isAdding || isTemporal) && (
               <Button
                  onClick={() => {
                      const defaultKey = 'startDateTime';
                      if (isAdding && !key) setKey(defaultKey);
                      onPickTime(key || defaultKey);
                  }}
                  variant="secondary"
                  size="xs"
                  className="text-green-300 bg-green-900/30 hover:bg-green-900/50 border-green-900/50"
                  icon={ClockIcon}
                  title="Pick date/time"
              >
                  Time
              </Button>
          )}
        </div>
      </div>
      <div className="relative">
          <Input
            placeholder="Key (e.g. price)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            autoFocus
          />
          {type && (
              <span className="absolute right-2 top-3 text-[10px] uppercase bg-gray-700 text-gray-300 px-1 rounded">
                  {type}
              </span>
          )}
      </div>
      {description && (
          <div className="text-xs text-gray-400 italic flex items-start gap-1">
              <InformationCircleIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
              {description}
          </div>
      )}
      <select
        className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
        value={op}
        onChange={(e) => setOp(e.target.value)}
      >
        <option value="is">is (=)</option>
        <option value="is not">is not (!=)</option>
        <option value="greater than">greater than (&gt;)</option>
        <option value="less than">less than (&lt;)</option>
        <option value="contains">contains</option>
      </select>
      <Input
        placeholder="Value (comma separated)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') onCancel();
        }}
      />
      <div className="flex justify-end gap-2 pt-1">
        <IconButton
          onClick={onCancel}
          variant="secondary"
          icon={XIcon}
          title="Cancel"
        />
        <IconButton
          onClick={handleSave}
          variant="ghost"
          className="text-green-500 hover:text-green-400 hover:bg-gray-700"
          icon={CheckIcon}
          title="Save"
        />
      </div>
    </div>
  );
};
