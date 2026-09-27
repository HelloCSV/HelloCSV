import { useId } from 'preact/hooks';

interface Props {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  label?: string;
}

export default function Checkbox({ checked, setChecked, label }: Props) {
  const id = useId();

  return (
    <div className="hc:flex hc:gap-3">
      <div className="hc:flex hc:h-6 hc:shrink-0 hc:items-center">
        <div className="hc:group hc:grid hc:size-4 hc:grid-cols-1">
          <input
            checked={checked}
            onChange={(e) => setChecked((e.target as HTMLInputElement).checked)}
            id={id}
            type="checkbox"
            className="hc:checked:border-hello-csv-primary hc:checked:bg-hello-csv-primary hc:indeterminate:border-hello-csv-primary hc:indeterminate:bg-hello-csv-primary hc:focus-visible:outline-hello-csv-primary hc:border-hello-csv-border-strong hc:bg-hello-csv-surface hc:disabled:border-hello-csv-border-strong hc:disabled:bg-hello-csv-surface-sunken hc:disabled:checked:bg-hello-csv-surface-sunken hc:col-start-1 hc:row-start-1 hc:appearance-none hc:rounded-sm hc:border hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 hc:forced-colors:appearance-auto"
          />
          <svg
            fill="none"
            viewBox="0 0 14 14"
            className="hc:stroke-hello-csv-primary-contrast hc:group-has-disabled:stroke-hello-csv-text-subtle hc:pointer-events-none hc:col-start-1 hc:row-start-1 hc:size-3.5 hc:self-center hc:justify-self-center"
          >
            <path
              d="M3 8L6 11L11 3.5"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hc:opacity-0 hc:group-has-checked:opacity-100"
            />
            <path
              d="M3 7H11"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="hc:opacity-0 hc:group-has-indeterminate:opacity-100"
            />
          </svg>
        </div>
      </div>
      {label && (
        <div className="hc:text-sm/6">
          <label htmlFor={id} className="hc:text-hello-csv-text hc:font-medium">
            {label}
          </label>
        </div>
      )}
    </div>
  );
}
