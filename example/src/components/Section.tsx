import { ReactNode } from 'preact/compat';

interface Props {
  children: ReactNode;
  className?: string;
}

export default function Section({ children, className }: Props) {
  return (
    <div className={`lg:-z-1 lg:-skew-y-3 ${className}`}>
      <div className="lg:skew-y-3">{children}</div>
    </div>
  );
}
