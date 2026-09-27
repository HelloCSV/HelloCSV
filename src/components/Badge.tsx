import { cva } from 'cva';
import { ReactNode } from 'preact/compat';

type BadgeVariant = 'primary' | 'success' | 'error';

interface Props {
  children?: ReactNode;
  variant?: BadgeVariant;
}

const baseClasses = cva(
  'hc:inline-flex hc:items-center hc:rounded-md hc:px-1.5 hc:py-0.5',
  {
    variants: {
      variant: {
        primary:
          'hc:bg-hello-csv-primary-extra-light hc:text-xs hc:font-medium',
        success:
          'hc:bg-hello-csv-success-extra-light hc:text-hello-csv-success hc:text-xs hc:font-medium',
        error:
          'hc:bg-hello-csv-danger-extra-light hc:text-hello-csv-danger hc:text-xs hc:font-medium',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export default function Badge({ children, variant }: Props) {
  const componentClassName = baseClasses({ variant });

  return <div className={componentClassName}>{children}</div>;
}
