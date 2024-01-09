export function truncate(string: string) {
  string = String(string);
  let length = 30;
  let omission = '...';
  let strLength = string.length;

  if (length >= strLength) {
    return string;
  }
  let end = length - omission.length;
  if (end < 1) {
    return omission;
  }
  let result = string.slice(0, end);

  return result + omission;
}
