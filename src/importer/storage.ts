import { ImporterState } from './types';
import { SheetDefinition } from '../sheet/types';

const DB_NAME = 'HelloCSV';
const DB_VERSION = 1;
const STORE_NAME = 'state';

export async function getIndexedDBState(
  sheetDefinitions: SheetDefinition[],
  customKey?: string | null
): Promise<ImporterState | null> {
  return new Promise((resolve, reject) => {
    const key = stateKey(sheetDefinitions, customKey);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(key);

      getRequest.onerror = () => resolve(null);
      getRequest.onsuccess = () => {
        try {
          const result = getRequest.result;
          result.sheetDefinitions = sheetDefinitions;
          resolve(result);
        } catch (error) {
          resolve(null);
        }
      };
    };
  });
}

export async function setIndexedDBState(
  state: ImporterState,
  customKey?: string | null
): Promise<void> {
  return new Promise((resolve, reject) => {
    const key = stateKey(state.sheetDefinitions, customKey);
    const value = { ...state } as any;
    delete value.sheetDefinitions; // sheetDefinitions have functions within, this should not be saved in the database
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const putRequest = store.put(value, key);

      putRequest.onerror = () => reject(putRequest.error);
      putRequest.onsuccess = () => resolve();
    };
  });
}

function stateKey(
  sheetDefinitions: SheetDefinition[],
  customKey?: string | null
): string {
  const prefix = customKey ? `importer-state-${customKey}` : 'importer-state';
  const key = JSON.stringify(sheetDefinitions);
  return `${prefix}-${hashString(key)}`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}
