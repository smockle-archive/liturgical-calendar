import type { LiturgicalDay } from "romcal";
import type { EventAttributes } from "ics";
import { toDateArray } from "./toDateArray.ts";
import { getDayAfter } from "./getDayAfter.ts";

// Convert a liturgical calendar object to an array of ics events.
export function toIcsEvents(
  calendar: Record<string, LiturgicalDay>
): EventAttributes[] {
  let events: EventAttributes[] = [];
  for (const [date, celebration] of Object.entries(calendar)) {
    events.push({
      title: celebration.name,
      start: toDateArray(date),
      end: toDateArray(getDayAfter(date)),
    });
  }
  return events;
}
