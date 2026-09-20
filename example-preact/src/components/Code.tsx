import { ReactNode } from 'preact/compat';
import { useDarkMode } from '../DarkModeContext';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Code({ children, className = '' }: Props) {
  const { darkMode } = useDarkMode();

  return (
    <code
      className={`rounded-md p-1 ${
        darkMode ? 'bg-slate-700 text-slate-100' : 'bg-gray-200 text-gray-900'
      } ${className}`}
    >
      {children}
    </code>
  );
}
