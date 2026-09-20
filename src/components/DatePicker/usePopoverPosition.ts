import { RefObject } from 'preact/compat';
import { useLayoutEffect, useState } from 'preact/hooks';
import { clamp } from '@/utils';

/** Gap between the trigger and the panel, and the min gap from the viewport edge. */
const PANEL_OFFSET = 4;
const VIEWPORT_PADDING = 8;

interface Options {
  open: boolean;
  inputRef: RefObject<HTMLInputElement>;
  panelRef: RefObject<HTMLDivElement>;
  /** Called when the anchor input scrolls out of view (so the caller can close). */
  onScrollAway: () => void;
}

/**
 * Positions a portaled popover panel relative to the trigger input. Uses page
 * coordinates + `position: absolute` (like the sheet tooltip) so it scrolls with
 * the document; scroll/resize listeners keep it aligned during the grid's inner
 * (overflow) scroll, and it flips above / clamps to the viewport so it never
 * renders off-screen. Closes (via `onScrollAway`) once the anchor leaves view.
 */
export function usePopoverPosition({
  open,
  inputRef,
  panelRef,
  onScrollAway,
}: Options): { top: number; left: number } {
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useLayoutEffect(() => {
    if (!open) return;

    const compute = () => {
      const input = inputRef.current;
      const panel = panelRef.current;
      if (!input || !panel) return;

      const rect = input.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;

      // Close once the anchor cell scrolls out of view, rather than leaving the
      // panel stuck against the viewport edge.
      const outOfView =
        rect.bottom <= 0 ||
        rect.top >= vh ||
        rect.right <= 0 ||
        rect.left >= vw;

      if (outOfView) {
        onScrollAway();
        return;
      }

      const panelHeight = panel.offsetHeight;
      const panelWidth = panel.offsetWidth;
      const spaceBelow = vh - rect.bottom;

      const openUp = spaceBelow < panelHeight && rect.top > spaceBelow;

      const rawTop = openUp
        ? rect.top - panelHeight - PANEL_OFFSET
        : rect.bottom + PANEL_OFFSET;

      // Clamp to the viewport so the panel never renders off-screen, then add
      // scroll offsets (the panel is `position: absolute` in page coordinates).
      const top = clamp(
        rawTop,
        VIEWPORT_PADDING,
        vh - panelHeight - VIEWPORT_PADDING
      );
      const left = clamp(
        rect.left,
        VIEWPORT_PADDING,
        vw - panelWidth - VIEWPORT_PADDING
      );

      setPos({ top: top + window.scrollY, left: left + window.scrollX });
    };

    compute();
    window.addEventListener('scroll', compute, true);
    window.addEventListener('resize', compute);

    return () => {
      window.removeEventListener('scroll', compute, true);
      window.removeEventListener('resize', compute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return pos;
}
