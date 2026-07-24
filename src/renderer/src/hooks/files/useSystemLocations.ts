import { useEffect, useState } from 'react';
import { Cloud, Disc, Folder, HardDrive, Home, Trash2, type LucideIcon } from 'lucide-react';
import type { SystemLocation } from '@shared/types/native';

export function getLocationIcon(iconType: string | undefined): LucideIcon {
  switch (iconType) {
    case 'hd':
      return HardDrive;
    case 'removable':
      return Disc;
    case 'cloud':
      return Cloud;
    case 'trash':
      return Trash2;
    case 'home':
      return Home;
    default:
      return Folder;
  }
}

const DEFAULT_LOCATIONS: SystemLocation[] = [
  { id: '/', name: 'Macintosh HD', path: '/', iconType: 'hd', isRemovable: false, isInternal: true },
];

export function useSystemLocations(): SystemLocation[] {
  const [locations, setLocations] = useState<SystemLocation[]>(DEFAULT_LOCATIONS);

  useEffect(() => {
    let isMounted = true;

    window.morph
      .invoke('native:getLocations', undefined)
      .then((result) => {
        if (isMounted && Array.isArray(result) && result.length > 0) {
          setLocations(result);
        }
      })
      .catch(() => {
        // Fallback stays as default Macintosh HD
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return locations;
}
