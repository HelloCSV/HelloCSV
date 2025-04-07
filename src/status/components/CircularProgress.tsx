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
      <div className="flex justify-center">
        <div
          className={`border-hello-csv-success-light h-22 w-22 rounded-full border-10 ${
            pending && `animate-spin border-t-transparent`
          }`}
        ></div>
      </div>
    );
  }

  return (
    <svg className="mx-auto h-24 w-24 rotate-[-90deg]" width="100" height="100">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        className="text-gray-200"
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
        className="stroke-hello-csv-success-light transition-[stroke-dashoffset] duration-500"
      />
    </svg>
  );
}
