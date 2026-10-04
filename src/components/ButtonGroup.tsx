import { cva } from 'cva';

interface Props {
  activeButton: string;
  buttons: ButtonGroupDefinition[];
}

export type ButtonGroupDefinition = {
  value: string;
  label: string;
  onClick: () => void;
  variant: 'default' | 'danger';
};

const buttonStyles = cva(
  'hc:relative hc:inline-flex hc:cursor-pointer hc:items-center hc:px-3 hc:py-2 hc:text-sm hc:font-semibold hc:ring-hello-csv-border-strong hc:ring-1 hc:ring-inset hc:focus:z-10',
  {
    variants: {
      active: {
        true: '',
        false: 'hc:bg-hello-csv-surface hc:hover:bg-hello-csv-surface-sunken',
      },
      variant: {
        default: '',
        danger: 'hc:text-hello-csv-danger',
      },
      location: {
        left: 'hc:rounded-l-md',
        center: 'hc:-ml-px',
        right: 'hc:rounded-r-md hc:-ml-px ',
      },
    },
    compoundVariants: [
      {
        active: true,
        variant: 'default',
        className: 'hc:bg-hello-csv-primary hc:text-hello-csv-primary-contrast',
      },
      {
        active: true,
        variant: 'danger',
        className: 'hc:bg-hello-csv-danger hc:text-hello-csv-danger-contrast',
      },
      {
        active: false,
        variant: 'default',
        className: 'hc:text-hello-csv-text',
      },
      {
        active: false,
        variant: 'danger',
        className: 'hc:text-hello-csv-danger',
      },
    ],
  }
);

export default function ButtonGroup({ activeButton, buttons }: Props) {
  return (
    <span className="hc:isolate hc:inline-flex hc:rounded-md hc:shadow-xs">
      {buttons.map((button, index) => (
        <button
          key={button.value}
          type="button"
          onClick={button.onClick}
          aria-current={button.value === activeButton}
          className={buttonStyles({
            active: button.value === activeButton,
            variant: button.variant,
            location:
              index === 0
                ? 'left'
                : index === buttons.length - 1
                  ? 'right'
                  : 'center',
          })}
        >
          {button.label}
        </button>
      ))}
    </span>
  );
}
