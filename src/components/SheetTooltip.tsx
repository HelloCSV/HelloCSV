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
  'hc:bg-hello-csv-tooltip-surface hc:text-hello-csv-tooltip-text hc:absolute hc:left-0 hc:z-20 hc:hidden hc:w-max hc:max-w-xs hc:whitespace-normal hc:rounded-md hc:border-l-4 hc:py-2 hc:pr-3 hc:pl-2.5 hc:text-xs hc:shadow-lg hc:group-focus-within:block hc:group-hover:block',
  {
    variants: {
      variant: {
        error: 'hc:border-hello-csv-danger',
        info: 'hc:border-hello-csv-border-strong',
      },
      placement: {
        bottom: 'hc:top-full hc:mt-2',
        top: 'hc:bottom-full hc:mb-2',
      },
    },
    defaultVariants: {
      variant: 'info',
      placement: 'bottom',
    },
  }
);

const tooltipWrapperBaseClasses = cva(
  'hc:group hc:relative hc:h-full hc:w-full',
  {
    variants: {
      withOutline: {
        true: 'hc:hover:z-5 hc:focus-within:z-5',
        false: '',
      },
    },
    defaultVariants: {
      withOutline: false,
    },
  }
);

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

  const arrowClassName = `hc:absolute hc:left-3 hc:h-2 hc:w-2 hc:rotate-45 hc:bg-hello-csv-tooltip-surface ${
    placement === 'top' ? 'hc:-bottom-1' : 'hc:-top-1'
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
