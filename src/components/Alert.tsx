import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import { ReactNode } from 'preact/compat';

type VariantType = 'info' | 'success' | 'error' | 'warning';

interface Props {
  variant?: VariantType;
  header?: string;
  description: string;
}

const baseClasses: Record<VariantType, { icon?: ReactNode; classes?: string }> =
  {
    info: {
      icon: (
        <InformationCircleIcon
          className="text-hello-csv-primary-light size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'bg-hello-csv-primary-extra-light text-hello-csv-primary rounded-md p-4',
    },
    success: {
      icon: (
        <CheckCircleIcon
          className="text-hello-csv-success-light size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'bg-hello-csv-success-extra-light text-hello-csv-success rounded-md p-4',
    },
    error: {
      icon: (
        <ExclamationTriangleIcon
          className="text-hello-csv-danger-light size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'bg-hello-csv-danger-extra-light text-hello-csv-danger rounded-md p-4',
    },
    warning: {
      icon: (
        <ExclamationTriangleIcon
          className="text-hello-csv-warning-light size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'bg-hello-csv-warning-extra-light text-hello-csv-warning rounded-md p-4',
    },
  };

export default function Alert({
  variant = 'info',
  header,
  description,
}: Props) {
  const { icon, classes } = baseClasses[variant];

  return (
    <div className={classes}>
      <div className="flex">
        <div className="mt-1 shrink-0">{icon}</div>
        <div className="ml-3">
          {header && <div className="text-md">{header}</div>}
          <div className="text-sm">{description}</div>
        </div>
      </div>
    </div>
  );
}
