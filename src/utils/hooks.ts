import { useCallback, useRef } from 'preact/hooks';

const LONG_PRESS_DELAY = 500;
const LONG_PRESS_ALLOWED_MOVE_THRESHOLD = 10;

export function useLongPress(
  onLongPress: () => void,
  { disabled = false } = {}
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const moved = useRef(false);

  const start = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      if (disabled) return;
      const touch = e.touches[0];
      startX.current = touch.clientX;
      startY.current = touch.clientY;
      moved.current = false;

      timeoutRef.current = setTimeout(() => {
        if (!moved.current) {
          onLongPress();
        }
      }, LONG_PRESS_DELAY);
    },
    [onLongPress, disabled]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const move = useCallback(
    (e: React.TouchEvent<HTMLElement>) => {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - startX.current);
      const dy = Math.abs(touch.clientY - startY.current);
      if (
        dx > LONG_PRESS_ALLOWED_MOVE_THRESHOLD ||
        dy > LONG_PRESS_ALLOWED_MOVE_THRESHOLD
      ) {
        moved.current = true;
        clear();
      }
    },
    [clear]
  );

  return {
    onTouchStart: start,
    onTouchMove: move,
    onTouchEnd: clear,
    onTouchCancel: clear,
    onMouseLeave: clear,
  };
}
