import React from 'react';

import { useMapView } from '../../hooks/useMapView';
import { MapPinIcon } from '../layout/icons';

export function MapView() {
  const { mapContainerRef, hasPoints } = useMapView();

  return (
    <div className="h-full w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4 relative">
      {!hasPoints && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm text-center p-8">
              <div className="bg-blue-900/20 p-4 rounded-full mb-4">
                  <MapPinIcon className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Location Notes</h3>
              <p className="text-gray-400 max-w-md">
                  Add location properties to your notes to see them here.
                  <br />
                  Try: <code className="bg-gray-800 px-1 py-0.5 rounded text-blue-300">[location:is:New York]</code>
              </p>
          </div>
      )}
      <div ref={mapContainerRef} className="flex-grow w-full" />
    </div>
  );
}
