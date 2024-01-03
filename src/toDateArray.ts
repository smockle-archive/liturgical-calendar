// Convert a date in YYYY-MM-DD format to an array of numbers.
export function toDateArray(YYYYMMDD: string): [number, number, number] {
  return YYYYMMDD.split("-").map((n) => Number(n)) as [number, number, number];
}
