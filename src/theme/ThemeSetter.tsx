import { ReactNode } from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { useImporterDefinition } from '@/importer/hooks';

interface ThemeSetterProps {
  children: ReactNode;
}

export const ThemeSetter: React.FC<ThemeSetterProps> = ({ children }) => {
  const { theme } = useImporterDefinition();

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('hello-csv-data-theme', theme);
    }
  }, [theme]);

  return <>{children}</>;
};
