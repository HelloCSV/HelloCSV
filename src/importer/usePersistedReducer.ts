import { useEffect, useState } from 'preact/hooks';
import { setInIndexedDB } from '../utils/storage';
import { ImporterState, ImporterAction } from '../types';

export function stripFunctions(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(stripFunctions);
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] !== 'function') {
      result[key] = stripFunctions(obj[key]);
    }
  }
  return result;
}

export function usePersistedReducer(
  reducer: (state: ImporterState, action: ImporterAction) => ImporterState,
  initialState: ImporterState,
  storageKey: string
): [ImporterState | null, ((action: ImporterAction) => void) | null, boolean] {
  const [state, setState] = useState<ImporterState>(initialState);
  const [dispatch, setDispatch] = useState<
    ((action: ImporterAction) => void) | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadState = async () => {
      try {
        if (!mounted) return;

        const persistedReducer = (
          state: ImporterState,
          action: ImporterAction
        ): ImporterState => {
          const newState = reducer(state, action);
          console.log('newState', newState);
          console.log('action', action);
          setInIndexedDB(storageKey, stripFunctions(newState)).catch(
            console.error
          );
          return newState;
        };

        setDispatch(() => (action: ImporterAction) => {
          console.log('prev', state);
          setState(persistedReducer(state, action));
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading persisted state:', error);
        setIsLoading(false);
      }
    };

    loadState();

    return () => {
      mounted = false;
    };
  }, [reducer, storageKey, state]);

  return [state, dispatch, isLoading];
}
