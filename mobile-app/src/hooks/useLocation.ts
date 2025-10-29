import { useState } from 'react';

export const useLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<string>('Mumbai');

  const requestLocation = async () => {
    // Implement location permission and fetch
    // For now, just set a default location
    setCurrentLocation('Mumbai');
  };

  return {
    currentLocation,
    requestLocation,
  };
};

