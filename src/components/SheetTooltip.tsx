import { cva } from 'cva';
import { ReactNode } from 'preact/compat';

type Variant = 'error' | 'info';

interface Props {
  variant?: Variant;
  children?: ReactNode;
  tooltipText?: string;
}

const tooltipBaseClasses = cva(
  'bg-gray-50 text-gray-900 absolute outline top-full w-full whitespace-normal z-5 mb-2 hidden px-2 py-4 text-xs group-focus-within:block group-hover:block',
  {
    variants: {
      variant: {
        error: 'outline-hello-csv-danger',
        info: 'outline-gray-500',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const tooltipWrapperBaseClasses = cva('group relative h-full w-full', {
  variants: {
    variant: {
      error:
        'focus-within:outline-hello-csv-danger hover:outline-hello-csv-danger',
      info: 'focus-within:outline-gray-500 hover:outline-gray-500',
    },
    withOutline: {
      true: 'focus-within:outline hover:outline hover:z-5 focus-within:z-5',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'info',
    withOutline: false,
  },
});

export default function SheetTooltip({
  variant,
  children,
  tooltipText,
}: Props) {
  const tooltipClassName = tooltipBaseClasses({ variant });
  const tooltipWrapperClassName = tooltipWrapperBaseClasses({
    variant,
    withOutline: !!tooltipText,
  });

  // Add tabIndex to make the tooltip focusable
  return (
    <div className={tooltipWrapperClassName} tabIndex={0}>
      {children}
      {tooltipText && <span className={tooltipClassName}>{tooltipText}</span>}
    </div>
  );
}
