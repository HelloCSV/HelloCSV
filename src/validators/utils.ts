let counter = 0;

export function generateValidationRunId(): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return `${Date.now()}-${counter}`;
}
