import { useEffect } from 'react';
import { initOneSignalFromLocalConfig } from '@/lib/oneSignal';

export const useOneSignal = () => {
  useEffect(() => {
    initOneSignalFromLocalConfig();
  }, []);
};
