import { ReactNode } from 'preact/compat';
import { useDarkMode } from '../DarkModeContext';

interface Props {
  children: ReactNode;
}

export default function DocumentContainer({ children }: Props) {
  const { darkMode } = useDarkMode();

  return (
    <div
      className={`m-auto mb-12 md:w-[650px] lg:px-8 ${
        darkMode ? 'text-slate-200' : 'text-gray-800'
      }`}
    >
      {children}
    </div>
  );
}
