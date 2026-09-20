// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/preact';
import DatePicker from './DatePicker';
import { TranslationProvider } from '@/i18';
import { DATE_PICKER_PANEL_ATTR } from '@/constants';

const PANEL = `[${DATE_PICKER_PANEL_ATTR}]`;

beforeEach(() => {
  globalThis.ResizeObserver = class {
    observe() {}

    unobserve() {}

    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(() => cleanup());

function renderPicker(props: Partial<Parameters<typeof DatePicker>[0]> = {}) {
  const onCommit = vi.fn();
  const utils = render(
    <TranslationProvider>
      <DatePicker mode="date" value="" onCommit={onCommit} {...props} />
    </TranslationProvider>
  );
  return { ...utils, onCommit };
}

describe('DatePicker', () => {
  it('renders the trigger with the display-formatted stored value', () => {
    const { container } = renderPicker({ value: '2026-12-31' });
    const input = container.querySelector('input')!;
    expect(input.value).toBe('Dec 31, 2026');
  });

  it('commits a normalized ISO value when typing a valid date and pressing Enter', () => {
    const { container, onCommit } = renderPicker({
      displayFormat: 'DD/MM/YYYY',
    });
    const input = container.querySelector('input')!;
    fireEvent.input(input, { target: { value: '31/12/2026' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('2026-12-31');
  });

  it('commits the value in a custom outputFormat', () => {
    const { container, onCommit } = renderPicker({
      outputFormat: 'DD/MM/YYYY',
    });
    const input = container.querySelector('input')!;
    fireEvent.input(input, { target: { value: '2026-12-31' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('31/12/2026');
  });

  it('commits empty when cleared and Enter is pressed', () => {
    const { container, onCommit } = renderPicker({ value: '2026-12-31' });
    const input = container.querySelector('input')!;
    fireEvent.input(input, { target: { value: '' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('');
  });

  it('keeps unparseable typed text verbatim on commit (so a validator can flag it)', () => {
    const { container, onCommit } = renderPicker();
    const input = container.querySelector('input')!;
    fireEvent.input(input, { target: { value: 'not a date' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCommit).toHaveBeenCalledWith('not a date');
  });

  it('seeds the input from type-to-edit text', () => {
    const { container } = renderPicker({ seedText: '2' });
    const input = container.querySelector('input')!;
    expect(input.value).toBe('2');
  });

  // The popover panel is portaled to <body>, so panel content is queried via
  // `document`, not the render container.
  it('renders a labelled calendar grid for the date mode', () => {
    renderPicker();
    const grid = document.querySelector('[role="grid"]');
    expect(grid).not.toBeNull();
    // 6 week rows of day cells.
    const dayCells = document.querySelectorAll('[role="gridcell"]');
    expect(dayCells.length).toBe(42);
  });

  it('renders hours + minutes (no seconds, no calendar) for the time mode by default', () => {
    renderPicker({ mode: 'time', value: '10:30' });
    expect(document.querySelector('[role="grid"]')).toBeNull();
    const numberInputs = document.querySelectorAll(
      `${PANEL} input[type="number"]`
    );
    expect(numberInputs.length).toBe(2);
  });

  it('adds a seconds field when showSeconds is set', () => {
    renderPicker({ mode: 'time', value: '10:30:15', showSeconds: true });
    const numberInputs = document.querySelectorAll(
      `${PANEL} input[type="number"]`
    );
    expect(numberInputs.length).toBe(3);
  });

  it('uses a 1-12 hours field with an AM/PM toggle in 12h mode (default)', () => {
    renderPicker({ mode: 'time', value: '13:30' });
    const panel = document.querySelector(PANEL)!;
    const hours = panel.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement;
    expect(hours.max).toBe('12');
    expect(hours.value).toBe('01'); // 13:00 -> 1 PM
    const ampm = Array.from(panel.querySelectorAll('button')).filter(
      (b) => b.textContent === 'AM' || b.textContent === 'PM'
    );
    expect(ampm.length).toBe(2);
    expect(
      ampm.find((b) => b.textContent === 'PM')!.getAttribute('aria-pressed')
    ).toBe('true');
  });

  it('uses a 0-23 hours field and no AM/PM toggle in 24h mode', () => {
    renderPicker({ mode: 'time', value: '13:30', hourFormat: '24h' });
    const panel = document.querySelector(PANEL)!;
    const hours = panel.querySelector(
      'input[type="number"]'
    ) as HTMLInputElement;
    expect(hours.max).toBe('23');
    expect(hours.value).toBe('13');
    const ampm = Array.from(panel.querySelectorAll('button')).filter(
      (b) => b.textContent === 'AM' || b.textContent === 'PM'
    );
    expect(ampm.length).toBe(0);
  });

  it('shows the trigger value in 24h format when hourFormat is 24h', () => {
    const { container } = renderPicker({
      mode: 'time',
      value: '13:30',
      hourFormat: '24h',
    });
    expect(container.querySelector('input')!.value).toBe('13:30');
  });

  it('renders both a calendar and time fields for datetime mode', () => {
    renderPicker({
      mode: 'datetime',
      value: '2026-12-31T10:30',
    });
    expect(document.querySelector('[role="grid"]')).not.toBeNull();
    expect(
      document.querySelectorAll(`${PANEL} input[type="number"]`).length
    ).toBe(2);
  });

  it('cycles the calendar to a month then year picker via the header title', () => {
    renderPicker({ value: '2026-09-20' });
    const panel = document.querySelector(PANEL)!;
    const title = panel.querySelector('button[aria-live="polite"]')!;
    expect(title.textContent).toContain('September 2026');
    fireEvent.click(title);
    expect(panel.querySelector('button[aria-live="polite"]')!.textContent).toBe(
      '2026'
    );
    fireEvent.click(panel.querySelector('button[aria-live="polite"]')!);
    expect(
      panel.querySelector('button[aria-live="polite"]')!.textContent
    ).toContain('2020 - 2029');
  });
});
