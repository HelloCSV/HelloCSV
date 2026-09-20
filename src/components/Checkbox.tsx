import { useId } from 'preact/hooks';

interface Props {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  label?: string;
}

export default function Checkbox({ checked, setChecked, label }: Props) {
  const id = useId();

  return (
    <div className="flex gap-3">
      <div className="flex h-6 shrink-0 items-center">
        <div className="group grid size-4 grid-cols-1">
          <input
            checked={checked}
            onChange={(e) => setChecked((e.target as HTMLInputElement).checked)}
            id={id}
            type="checkbox"
            className="checked:border-hello-csv-primary checked:bg-hello-csv-primary indeterminate:border-hello-csv-primary indeterminate:bg-hello-csv-primary focus-visible:outline-hello-csv-hello-csv-primary border-hello-csv-border-strong bg-hello-csv-surface disabled:border-hello-csv-border-strong disabled:bg-hello-csv-surface-sunken disabled:checked:bg-hello-csv-surface-sunken col-start-1 row-start-1 appearance-none rounded-sm border focus-visible:outline-2 focus-visible:outline-offset-2 forced-colors:appearance-auto"
          />
          <svg
            fill="none"
            viewBox="0 0 14 14"
            className="stroke-hello-csv-primary-contrast group-has-disabled:stroke-hello-csv-text-subtle pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center"
          >
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-checked:opacity-100"
            />
            <path
              d="M3 7H11"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-0 group-has-indeterminate:opacity-100"
            />
          </svg>
        </div>
      </div>
      {label && (
        <div className="text-sm/6">
          <label htmlFor={id} className="text-hello-csv-text font-medium">
            {label}
          </label>
        </div>
      )}
    </div>
  );
}
