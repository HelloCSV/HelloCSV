import { createContext } from 'preact';
import { useContext } from 'preact/hooks';

export interface DarkModeContextValue {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const DarkModeContext = createContext<DarkModeContextValue>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export function useDarkMode() {
  return useContext(DarkModeContext);
}
