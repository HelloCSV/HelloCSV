export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function stripFunctions(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(stripFunctions);
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] !== 'function') {
      result[key] = stripFunctions(obj[key]);
    }
  }
  return result;
}
