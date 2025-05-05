import { ImporterState } from '../importer/types';
import { SheetDefinition } from '../sheet/types';

const DB_NAME = 'HelloCSV';
const DB_VERSION = 1;
const STORE_NAME = 'state';

export async function getIndexedDBState(
  sheetDefinitions: SheetDefinition[]
): Promise<ImporterState> {
  return new Promise((resolve, reject) => {
    const key = getStateKey(sheetDefinitions);
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(key);

      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = () => {
        try {
          const result = getRequest.result;
          result.sheetDefinitions = sheetDefinitions;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

export async function setIndexedDBState(state: ImporterState): Promise<void> {
  return new Promise((resolve, reject) => {
    const key = getStateKey(state.sheetDefinitions);
    const value = { ...state } as any;
    delete value.sheetDefinitions;
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

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

function getStateKey(array: any[]): string {
  const key = array.map((item) => `${item.id}-${item.label}`).join('|');
  return `importer-state-${hashString(key)}`;
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
