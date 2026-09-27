import { ReactNode } from 'preact/compat';
import { XCircleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

export default function Error({ children }: Props) {
  return (
    <div className="hc:flex">
      <div className="hc:shrink-0">
        <XCircleIcon
          aria-hidden="true"
          className="hc:text-hello-csv-danger hc:size-5"
        />
      </div>
      <div className="hc:ml-3 hc:flex-1 hc:md:flex hc:md:justify-between">
        <p className="hc:text-hello-csv-danger hc:text-sm">{children}</p>
      </div>
    </div>
  );
}
