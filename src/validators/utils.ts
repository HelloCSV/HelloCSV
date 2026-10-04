let counter = 0;

export function generateProcessingRunId(): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now()}-${counter}`;
}
