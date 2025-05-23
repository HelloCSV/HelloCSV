import { cva } from 'cva';
import {
  createPortal,
  MouseEvent,
  FocusEvent,
  ReactNode,
  useEffect,
  useId,
  useState,
  useRef,
} from 'preact/compat';
import { ROOT_CLASS } from '../constants';
import { useInViewObserver } from '../utils/hooks';

type Variant = 'error' | 'info';

interface Props {
  variant?: Variant;
  children?: ReactNode;
  tooltipText?: string;
}

const tooltipBaseClasses = cva(
  'absolute z-50 bg-gray-50 text-gray-900 outline top-full w-full whitespace-normal mb-2 px-2 py-4 text-xs opacity-100 aria-hidden:opacity-0 aria-hidden:z-[-1]',
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
  const tooltipWrapperClassName = tooltipWrapperBaseClasses({
    variant,
    withOutline: !!tooltipText,
  });

  const triggerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const { tipRef, inView } = useInViewObserver();

  const [tooltipContainer, setTooltipContainer] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement('div');
    div.classList.add(ROOT_CLASS);
    document.body.appendChild(div);
    setTooltipContainer(div);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  const showTooltip = (
    _event: MouseEvent<HTMLElement> | FocusEvent<HTMLElement>
  ) => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + rect.width / 2 + window.scrollX,
      width: rect.width,
    });
    setIsVisible(true);
  };

  const hideTooltip = () => {
    setIsVisible(false);
  };

  const tooltipId = useId();
  // Add tabIndex to make the tooltip focusable
  return (
    <div
      ref={(element) => {
        if (element) {
          triggerRef.current = element;
          tipRef.current = element;
        }
      }}
      className={tooltipWrapperClassName}
      tabIndex={0}
      aria-invalid={variant === 'error'}
      aria-errormessage={variant === 'error' ? tooltipId : undefined}
      aria-describedby={variant === 'error' ? tooltipId : undefined}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {tooltipText &&
        tooltipContainer &&
        inView &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            aria-label={tooltipText}
            aria-hidden={!isVisible}
            className={tooltipBaseClasses({ variant })}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
              width: position.width,
              transform: 'translateX(-50%)',
            }}
          >
            {tooltipText}
          </span>,
          tooltipContainer
        )}
    </div>
  );
}
