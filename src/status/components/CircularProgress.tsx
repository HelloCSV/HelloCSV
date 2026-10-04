import { useState, useEffect } from 'preact/hooks';

interface Props {
  progress: number;
  pending?: boolean;
}

export default function CircularProgress({ progress, pending }: Props) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const [progressUnavailable, setProgressUnavailable] = useState(false);

  useEffect(() => {
    if (progress === 0) {
      const timeout = setTimeout(() => {
        setProgressUnavailable(true);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [progress]);

  if (progressUnavailable) {
    return (
      <div className="hc:flex hc:justify-center">
        <div
          className={`hc:border-hello-csv-success-light hc:h-22 hc:w-22 hc:rounded-full hc:border-10 ${
            pending && `hc:animate-spin hc:border-t-transparent`
          }`}
        ></div>
      </div>
    );
  }

  return (
    <svg
      className="hc:mx-auto hc:h-24 hc:w-24 hc:rotate-[-90deg]"
      width="100"
      height="100"
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        className="hc:text-hello-csv-border"
        strokeWidth="10"
        stroke="currentColor"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="hc:stroke-hello-csv-success-light hc:transition-[stroke-dashoffset] hc:duration-500"
      />
    </svg>
  );
}
