import { cva } from 'cva';
import { ReactNode } from 'preact/compat';

type Variant = 'error' | 'info';
type Placement = 'bottom' | 'top';

interface Props {
  variant?: Variant;
  children?: ReactNode;
  tooltipText?: string;
  /**
   * When true (default) the wrapper is focusable so the tooltip appears on
   * keyboard focus. Set false when a focusable child (e.g. a grid cell) already
   * triggers `group-focus-within`, to avoid a duplicate tab stop.
   */
  focusable?: boolean;
  placement?: Placement;
}

const tooltipBaseClasses = cva(
  'bg-gray-900 text-white absolute left-0 z-20 hidden w-max max-w-xs whitespace-normal rounded-md border-l-4 py-2 pr-3 pl-2.5 text-xs shadow-lg group-focus-within:block group-hover:block',
  {
    variants: {
      variant: {
        error: 'border-hello-csv-danger',
        info: 'border-gray-400',
      },
      placement: {
        bottom: 'top-full mt-2',
        top: 'bottom-full mb-2',
      },
    },
    defaultVariants: {
      variant: 'info',
      placement: 'bottom',
    },
  }
);

const tooltipWrapperBaseClasses = cva('group relative h-full w-full', {
  variants: {
    withOutline: {
      true: 'hover:z-5 focus-within:z-5',
      false: '',
    },
  },
  defaultVariants: {
    withOutline: false,
  },
});

export default function SheetTooltip({
  variant,
  children,
  tooltipText,
  focusable = true,
  placement = 'bottom',
}: Props) {
  const tooltipClassName = tooltipBaseClasses({ variant, placement });
  const tooltipWrapperClassName = tooltipWrapperBaseClasses({
    withOutline: !!tooltipText,
  });

  const arrowClassName = `absolute left-3 h-2 w-2 rotate-45 bg-gray-900 ${
    placement === 'top' ? '-bottom-1' : '-top-1'
  }`;

  // Add tabIndex to make the tooltip focusable (unless a focusable child does).
  return (
    <div
      className={tooltipWrapperClassName}
      tabIndex={focusable ? 0 : undefined}
    >
      {children}
      {tooltipText && (
        <span className={tooltipClassName}>
          <span aria-hidden="true" className={arrowClassName} />
          {tooltipText}
        </span>
      )}
    </div>
  );
}
