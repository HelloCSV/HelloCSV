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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  style?: CSSProperties;
}

const baseClasses = cva('text-center inline-block font-semibold', {
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
    size: {
      xs: 'px-2 py-1 rounded-sm text-xs',
      sm: 'px-2 py-1 rounded-sm text-sm',
      md: 'px-2.5 py-1.5 rounded-md text-sm',
      lg: 'px-3 py-2 rounded-md text-sm',
      xl: 'px-3.5 py-2.5 rounded-md text-sm',
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
    size: 'lg',
    variant: 'primary',
    disabled: false,
  },
});

export default function Button({
  children,
  variant,
  disabled,
  onClick,
  size,
}: Props) {
  const componentClassName = baseClasses({ variant, disabled, size });

  return (
    <div className={componentClassName} onClick={onClick}>
      {children}
    </div>
  );
}
