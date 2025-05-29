import { cva } from 'cva';
import { ReactNode, createPortal } from 'preact/compat';
import { useEffect, useRef, useId, useState } from 'preact/hooks';
import { ROOT_CLASS } from '../constants';

interface Props {
  tooltipText: string;
  children: ReactNode;
  className?: string;
  hidden?: boolean;
}

const baseClasses = cva(
  'absolute z-50 w-max rounded-md bg-gray-900 px-3 py-2 text-xs text-white shadow-lg transition-opacity duration-200',
  {
    variants: {
      visible: {
        true: 'opacity-100',
        false: 'opacity-0 pointer-events-none',
      },
      hidden: {
        true: 'hidden',
        false: '',
      },
    },
  }
);

export default function Tooltip({
  tooltipText,
  children,
  className,
  hidden,
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
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

  const showTooltip = () => {
    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: triggerRect.bottom + window.scrollY + 8,
      left: triggerRect.left + triggerRect.width / 2 + window.scrollX,
    });

    setIsVisible(true);
  };

  const hideTooltip = () => setIsVisible(false);

  const tooltipId = useId();

  return (
    <div
      ref={triggerRef}
      tabIndex={0}
      className={`${className} relative inline-block`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
      aria-describedby={tooltipId}
    >
      {children}
      {tooltipContainer &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            aria-label={tooltipText}
            aria-hidden={!isVisible}
            ref={tooltipRef}
            className={baseClasses({ visible: isVisible, hidden })}
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            {tooltipText}
            <div className="absolute top-0 left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-gray-900"></div>
          </div>,
          tooltipContainer
        )}
    </div>
  );
}
