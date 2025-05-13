import { ReactNode } from 'preact/compat';

interface Props {
  children: ReactNode;
}

export default function Content({ children }: Props) {
  return (
    <div className="mx-auto max-w-6xl space-y-2 px-4 py-10 text-lg lg:py-24">
      {children}
    </div>
  );
}
