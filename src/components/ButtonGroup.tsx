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
  'relative inline-flex cursor-pointer items-center px-3 py-2 text-sm font-semibold ring-gray-300 ring-1 ring-inset focus:z-10',
  {
    variants: {
      active: {
        true: '',
        false: 'bg-white hover:bg-gray-50',
      },
      variant: {
        default: '',
        danger: 'text-hello-csv-danger',
      },
      location: {
        left: 'rounded-l-md',
        center: '-ml-px',
        right: 'rounded-r-md -ml-px ',
      },
    },
    compoundVariants: [
      {
        active: true,
        variant: 'default',
        className: 'bg-gray-900 text-white',
      },
      {
        active: true,
        variant: 'danger',
        className: 'bg-hello-csv-danger text-white',
      },
      {
        active: false,
        variant: 'default',
        className: 'text-gray-900',
      },
      {
        active: false,
        variant: 'danger',
        className: 'text-hello-csv-danger',
      },
    ],
  }
);

export default function ButtonGroup({ activeButton, buttons }: Props) {
  return (
    <span className="isolate inline-flex rounded-md shadow-xs">
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
