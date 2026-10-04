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
          className="hc:text-hello-csv-primary-light hc:size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'hc:bg-hello-csv-primary-extra-light hc:text-hello-csv-primary hc:rounded-md hc:p-4',
    },
    success: {
      icon: (
        <CheckCircleIcon
          className="hc:text-hello-csv-success-light hc:size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'hc:bg-hello-csv-success-extra-light hc:text-hello-csv-success hc:rounded-md hc:p-4',
    },
    error: {
      icon: (
        <ExclamationTriangleIcon
          className="hc:text-hello-csv-danger-light hc:size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'hc:bg-hello-csv-danger-extra-light hc:text-hello-csv-danger hc:rounded-md hc:p-4',
    },
    warning: {
      icon: (
        <ExclamationTriangleIcon
          className="hc:text-hello-csv-warning-light hc:size-5"
          aria-hidden="true"
        />
      ),
      classes:
        'hc:bg-hello-csv-warning-extra-light hc:text-hello-csv-warning hc:rounded-md hc:p-4',
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
      <div className="hc:flex">
        <div className="hc:mt-1 hc:shrink-0">{icon}</div>
        <div className="hc:ml-3">
          {header && <div className="hc:text-base">{header}</div>}
          <div className="hc:text-sm">{description}</div>
        </div>
      </div>
    </div>
  );
}
