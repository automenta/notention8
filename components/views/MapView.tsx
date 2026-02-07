import React from 'react';

import { useMapView } from '../../hooks/useMapView';

export function MapView() {
  const { mapContainerRef } = useMapView();

  return (
    <div className="h-full w-full bg-gray-800/50 rounded-lg p-4 flex flex-col gap-4">
      <div ref={mapContainerRef} className="flex-grow w-full" />
    </div>
  );
}
