import { cva } from 'cva';

type SpinnerColor = 'light' | 'dark';

interface Props {
  color?: SpinnerColor;
}

const spinner = cva(
  'inline-block rounded-full animate-spin border-t-transparent h-4 w-4 border-2',
  {
    variants: {
      color: {
        light: 'border-hello-csv-primary-contrast',
        dark: 'border-hello-csv-text',
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
