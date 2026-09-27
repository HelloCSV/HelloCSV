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
  'hc:text-center hc:inline-block hc:font-semibold hc:px-3 hc:py-2 hc:rounded-md hc:text-sm',
  {
    variants: {
      variant: {
        primary:
          'hc:shadow-xs hc:bg-hello-csv-primary hc:text-hello-csv-primary-contrast',
        secondary:
          'hc:bg-hello-csv-surface hc:text-hello-csv-primary hc:ring-1 hc:shadow-xs hc:ring-hello-csv-primary hc:ring-inset',
        tertiary:
          'hc:bg-hello-csv-surface hc:text-hello-csv-text hc:ring-1 hc:shadow-xs hc:ring-hello-csv-tertiary hc:ring-inset',
        success:
          'hc:shadow-xs hc:bg-hello-csv-success hc:text-hello-csv-success-contrast',
        danger:
          'hc:shadow-xs hc:bg-hello-csv-danger hc:text-hello-csv-danger-contrast',
      },
      withFullWidth: {
        true: 'hc:w-full',
        false: '',
      },
      disabled: {
        true: 'hc:opacity-50 hc:cursor-not-allowed hc:pointer-events-none',
        false: 'hc:cursor-pointer',
      },
    },
    compoundVariants: [
      {
        variant: 'primary',
        disabled: false,
        className:
          'hc:hover:bg-hello-csv-primary-light hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 hc:focus-visible:outline-hello-csv-primary',
      },
      {
        variant: 'secondary',
        disabled: false,
        className:
          'hc:hover:opacity-80 hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 hc:focus-visible:outline-hello-csv-secondary',
      },
      {
        variant: 'tertiary',
        disabled: false,
        className: 'hc:hover:bg-hello-csv-tertiary-light',
      },
      {
        variant: 'success',
        disabled: false,
        className:
          'hc:hover:opacity-80 hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 hc:focus-visible:outline-hello-csv-success',
      },
      {
        variant: 'danger',
        disabled: false,
        className:
          'hc:hover:bg-hello-csv-danger-light hc:focus-visible:outline-2 hc:focus-visible:outline-offset-2 hc:focus-visible:outline-hello-csv-danger',
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
