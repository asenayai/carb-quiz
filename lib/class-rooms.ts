export const CLASS_ROOMS = [
  "M.4/1",
  "M.4/2",
  "M.4/3",
  "M.4/4",
  "M.4/5",
  "M.4/6",
  "M.4/7",
  "M.4/8",
  "M.4/9",
  "M.4/10",
] as const;

export type ClassRoom = (typeof CLASS_ROOMS)[number];

export function isValidClassRoom(value: string): value is ClassRoom {
  return (CLASS_ROOMS as readonly string[]).includes(value);
}

export function mergeClassLabels(existing: string[]): string[] {
  return [...new Set([...CLASS_ROOMS, ...existing.filter(Boolean)])];
}
