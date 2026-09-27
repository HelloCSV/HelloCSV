import { cva } from 'cva';

type SpinnerColor = 'light' | 'dark';

interface Props {
  color?: SpinnerColor;
}

const spinner = cva(
  'hc:inline-block hc:rounded-full hc:animate-spin hc:border-t-transparent hc:h-4 hc:w-4 hc:border-2',
  {
    variants: {
      color: {
        light: 'hc:border-hello-csv-primary-contrast',
        dark: 'hc:border-hello-csv-text',
      },
    },
    defaultVariants: {
      color: 'dark',
    },
  }
);

export default function Spinner({ color = 'dark' }: Props) {
  return <span className={`${spinner({ color })}`} />;
}
