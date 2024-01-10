export function isEmpty(value: any): boolean {
  if (value == null) {
    return true;
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    if (value instanceof Map || value instanceof Set) {
      return value.size === 0;
    }

    return Object.keys(value).length === 0;
  }

  return false;
}
