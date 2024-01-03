import assert from "node:assert";
import { toDateArray } from "./toDateArray.js";

// Get the date one day after a given date, in YYYY-MM-DD format.
export function getDayAfter(YYYYMMDD: string): string {
  const [year, month, date] = toDateArray(YYYYMMDD);
  const dayAfter = new Date();
  dayAfter.setFullYear(year);
  dayAfter.setMonth(month - 1);
  dayAfter.setDate(date + 1);
  return new Intl.DateTimeFormat("sv-SE").format(dayAfter);
}
// Year rollover
assert.equal(getDayAfter("2023-12-31"), "2024-01-01");
// Normal day
assert.equal(getDayAfter("2024-02-27"), "2024-02-28");
// Leap day
assert.equal(getDayAfter("2024-02-28"), "2024-02-29");
// Month rollover
assert.equal(getDayAfter("2024-02-29"), "2024-03-01");
