import { cva } from 'cva';
import { ReactNode, createPortal } from 'preact/compat';
import { useEffect, useRef, useId, useState } from 'preact/hooks';
import { ROOT_CLASS } from '../constants';
import { clamp } from '@/utils';

interface Props {
  tooltipText: string;
  children: ReactNode;
  className?: string;
  hidden?: boolean;
}

type Placement = 'bottom' | 'top' | 'left' | 'right';

const OFFSET = 8;
const VIEWPORT_PADDING = 8;
const ARROW_SIZE = 8; // square before rotation
const ARROW_OFFSET = -4;

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
  const [placement, setPlacement] = useState<Placement>('bottom');
  const [arrowOffset, setArrowOffset] = useState(0);

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
    requestAnimationFrame(() => {
      if (!triggerRef.current || !tooltipRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const spaceBottom = vh - triggerRect.bottom;
      const spaceTop = triggerRect.top;
      const spaceRight = vw - triggerRect.right;

      let nextPlacement: Placement = 'bottom';

      if (spaceBottom >= tooltipRect.height + OFFSET) {
        nextPlacement = 'bottom';
      } else if (spaceTop >= tooltipRect.height + OFFSET) {
        nextPlacement = 'top';
      } else if (spaceRight >= tooltipRect.width + OFFSET) {
        nextPlacement = 'right';
      } else {
        nextPlacement = 'left';
      }

      let top = 0;
      let left = 0;

      switch (nextPlacement) {
        case 'bottom':
          top = triggerRect.bottom + OFFSET + window.scrollY;
          left =
            triggerRect.left +
            triggerRect.width / 2 -
            tooltipRect.width / 2 +
            window.scrollX;
          break;

        case 'top':
          top = triggerRect.top - tooltipRect.height - OFFSET + window.scrollY;
          left =
            triggerRect.left +
            triggerRect.width / 2 -
            tooltipRect.width / 2 +
            window.scrollX;
          break;

        case 'right':
          top =
            triggerRect.top +
            triggerRect.height / 2 -
            tooltipRect.height / 2 +
            window.scrollY;
          left = triggerRect.right + OFFSET + window.scrollX;
          break;

        case 'left':
          top =
            triggerRect.top +
            triggerRect.height / 2 -
            tooltipRect.height / 2 +
            window.scrollY;
          left = triggerRect.left - tooltipRect.width - OFFSET + window.scrollX;
          break;
      }

      top = clamp(
        top,
        VIEWPORT_PADDING + window.scrollY,
        window.scrollY + vh - tooltipRect.height - VIEWPORT_PADDING
      );

      left = clamp(
        left,
        VIEWPORT_PADDING + window.scrollX,
        window.scrollX + vw - tooltipRect.width - VIEWPORT_PADDING
      );

      // --- Arrow positioning ---
      const triggerCenterX =
        triggerRect.left + triggerRect.width / 2 + window.scrollX;
      const triggerCenterY =
        triggerRect.top + triggerRect.height / 2 + window.scrollY;

      let nextArrowOffset = 0;

      if (nextPlacement === 'top' || nextPlacement === 'bottom') {
        const relativeX = triggerCenterX - left;
        nextArrowOffset = clamp(
          relativeX,
          ARROW_SIZE,
          tooltipRect.width - ARROW_SIZE
        );
      } else {
        const relativeY = triggerCenterY - top;
        nextArrowOffset = clamp(
          relativeY,
          ARROW_SIZE,
          tooltipRect.height - ARROW_SIZE
        );
      }

      setPlacement(nextPlacement);
      setPosition({ top, left });
      setArrowOffset(nextArrowOffset);
      setIsVisible(true);
    });
  };

  const hideTooltip = () => setIsVisible(false);
  const tooltipId = useId();

  return (
    <div
      ref={triggerRef}
      tabIndex={0}
      className={`${className ?? ''} relative inline-block`}
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
            }}
          >
            {tooltipText}

            {/* Arrow */}
            <div
              className="absolute h-2 w-2 rotate-45 bg-gray-900"
              style={
                placement === 'bottom'
                  ? { top: ARROW_OFFSET, left: arrowOffset - ARROW_SIZE / 2 }
                  : placement === 'top'
                    ? {
                        bottom: ARROW_OFFSET,
                        left: arrowOffset - ARROW_SIZE / 2,
                      }
                    : placement === 'left'
                      ? {
                          right: ARROW_OFFSET,
                          top: arrowOffset - ARROW_SIZE / 2,
                        }
                      : {
                          left: ARROW_OFFSET,
                          top: arrowOffset - ARROW_SIZE / 2,
                        }
              }
            />
          </div>,
          tooltipContainer
        )}
    </div>
  );
}
