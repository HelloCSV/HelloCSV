export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash;
}

export function serializeFunctions(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(serializeFunctions);
  }

  const result: any = {};
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      result[key] = { __function__: obj[key].toString() };
    } else {
      result[key] = serializeFunctions(obj[key]);
    }
  }
  return result;
}

export function deserializeFunctions(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;

  if (Array.isArray(obj)) {
    return obj.map(deserializeFunctions);
  }

  const result: any = {};
  for (const key in obj) {
    if (obj[key]?.__function__) {
      result[key] = eval(obj[key].__function__);
    } else {
      result[key] = deserializeFunctions(obj[key]);
    }
  }
  return result;
}
