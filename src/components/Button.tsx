import { cva } from 'cva';
import { CSSProperties, ReactNode } from 'preact/compat';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'danger';

interface Props {
  children?: ReactNode;
  variant?: ButtonVariant;
  outline?: boolean;
  disabled?: boolean;
  withFullWidth?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

const baseClasses = cva(
  'text-center inline-block font-semibold px-3 py-2 rounded-md text-sm',
  {
    variants: {
      variant: {
        primary: 'shadow-xs bg-hello-csv-primary text-white',
        secondary:
          'bg-white text-hello-csv-primary ring-1 shadow-xs ring-bg-hello-csv-primary ring-inset',
        tertiary:
          'bg-white text-gray-900 ring-1 shadow-xs ring-hello-csv-tertiary ring-inset',
        success: 'shadow-xs bg-hello-csv-success text-white',
        danger: 'shadow-xs bg-hello-csv-danger text-white',
      },
      withFullWidth: {
        true: 'w-full',
        false: '',
      },
      disabled: {
        true: 'opacity-50 cursor-not-allowed pointer-events-none',
        false: 'cursor-pointer',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        disabled: false,
        className:
          'hover:bg-hello-csv-primary-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hello-csv-primary',
      },
      {
        variant: 'secondary',
        disabled: false,
        className:
          'hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hello-csv-secondary',
      },
      {
        variant: 'tertiary',
        disabled: false,
        className: 'hover:bg-hello-csv-tertiary-light',
      },
      {
        variant: 'success',
        disabled: false,
        className:
          'hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hello-csv-success',
      },
      {
        variant: 'danger',
        disabled: false,
        className:
          'hover:bg-hello-csv-danger-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hello-csv-danger',
      },
    ],
    defaultVariants: {
      withFullWidth: false,
      variant: 'primary',
      disabled: false,
    },
  }
);

export default function Button({
  children,
  variant,
  disabled,
  onClick,
  withFullWidth,
}: Props) {
  const componentClassName = baseClasses({ variant, disabled, withFullWidth });

  return (
    <div
      role="button"
      tabIndex={0}
      className={componentClassName}
      onClick={onClick}
      aria-disabled={disabled}
    >
      {children}
    </div>
  );
}
