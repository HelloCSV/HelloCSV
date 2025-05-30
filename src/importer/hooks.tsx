import { ReactNode, createContext, useContext } from 'preact/compat';
import { ImporterDefinitionWithDefaults } from './types';

const ServiceContext = createContext<ImporterDefinitionWithDefaults>(
  {} as ImporterDefinitionWithDefaults
);

export function ImporterDefinitionProvider({
  importerDefintion,
  children,
}: {
  importerDefintion: ImporterDefinitionWithDefaults;
  children: ReactNode;
}) {
  return (
    <ServiceContext.Provider value={importerDefintion}>
      {children}
    </ServiceContext.Provider>
  );
}

export function useImporterDefinition(): ImporterDefinitionWithDefaults {
  return useContext(ServiceContext);
}
