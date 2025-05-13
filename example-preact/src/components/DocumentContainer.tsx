import { ReactNode } from 'preact/compat';

interface Props {
  children: ReactNode;
}

export default function DocumentContainer({ children }: Props) {
  return (
    <div className="m-auto mb-12 text-gray-800 md:w-[650px] lg:px-8">
      {children}
    </div>
  );
}
