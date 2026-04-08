import { useState, useCallback } from 'react';
import { Modality } from '../interfaces/models/ICommon';

export function useModality() {
  const [modality, setModality] = useState<Modality>('aereo');

  const changeModality = useCallback((newModality: Modality) => {
    setModality(newModality);
  }, []);

  return { modality, changeModality };
}
