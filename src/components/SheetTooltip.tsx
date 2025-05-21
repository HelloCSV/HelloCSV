import { cva } from 'cva';
import {
  createPortal,
  MouseEvent,
  ReactNode,
  useEffect,
  useId,
  useState,
} from 'preact/compat';

type Variant = 'error' | 'info';

interface Props {
  variant?: Variant;
  children?: ReactNode;
  tooltipText?: string;
}

const tooltipBaseClasses = cva(
  'bg-gray-50 text-gray-900 absolute outline top-full w-full whitespace-normal z-5 mb-2 px-2 py-4 text-xs',
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

function Portal({ children }: { children: ReactNode | ReactNode[] }) {
  const portal = document.getElementById('portal-root');
  const el = document.createElement('div');

  useEffect(() => {
    if (portal) {
      portal.appendChild(el);
      return () => portal.removeChild(el);
    }
  }, [el, portal]);

  return createPortal(children, el);
}

export { Portal };
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

  const [coords, setCoords] = useState({ left: 0, top: 0, width: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const mouseEnter = (e: MouseEvent<HTMLElement>) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setCoords({
      left: rect.left,
      top: rect.top + rect.height,
      width: rect.width,
    });
    setShowTooltip(true);
  };

  const mouseLeave = () => {
    setShowTooltip(false);
  };

  const tooltipId = useId();
  // Add tabIndex to make the tooltip focusable
  return (
    <div
      className={tooltipWrapperClassName}
      tabIndex={0}
      aria-invalid={variant === 'error'}
      aria-errormessage={variant === 'error' ? tooltipId : undefined}
      aria-describedby={variant === 'error' ? tooltipId : undefined}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      {children}
      {tooltipText && showTooltip && (
        <Portal>
          <span
            id={tooltipId}
            role="tooltip"
            aria-label={tooltipText}
            className={tooltipClassName}
            style={{ left: coords.left, top: coords.top, width: coords.width }}
          >
            {tooltipText}
          </span>
        </Portal>
      )}
    </div>
  );
}
