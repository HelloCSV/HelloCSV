import { createContext, ReactNode } from 'preact/compat';
import { useContext } from 'preact/hooks';
import { GridSelection } from './useGridSelection';

const GridSelectionContext = createContext<GridSelection | null>(null);

export function GridSelectionProvider({
  value,
  children,
}: {
  value: GridSelection;
  children: ReactNode;
}) {
  return (
    <GridSelectionContext.Provider value={value}>
      {children}
    </GridSelectionContext.Provider>
  );
}

export function useGridSelectionContext(): GridSelection {
  const selection = useContext(GridSelectionContext);
  if (!selection) {
    throw new Error(
      'useGridSelectionContext must be used within a GridSelectionProvider'
    );
  }
  return selection;
}
