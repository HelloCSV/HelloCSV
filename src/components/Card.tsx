import { cva } from 'cva';
import { forwardRef, ReactNode } from 'preact/compat';

interface Props {
  className?: string;
  children?: ReactNode;
  variant?: 'default' | 'muted';
  withPadding?: boolean;
}

const baseClasses = cva(
  'hc:overflow-hidden hc:rounded-md hc:border hc:border-hello-csv-border',
  {
    variants: {
      variant: {
        default: 'hc:bg-hello-csv-surface',
        muted: 'hc:bg-hello-csv-muted',
      },
      withPadding: {
        true: 'hc:px-4 hc:py-5 hc:sm:p-6',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      withPadding: true,
    },
  }
);

const Card = forwardRef<HTMLDivElement, Props>(
  ({ children, className, variant, withPadding = true }, ref) => {
    const componentClassName = baseClasses({ variant, withPadding });

    return (
      <div ref={ref} className={`${componentClassName} ${className}`}>
        {children}
      </div>
    );
  }
);

export default Card;
