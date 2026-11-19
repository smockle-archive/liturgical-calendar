import { createEvents, type EventAttributes } from "ics";
import { normalizeIcs } from "./normalizeIcs.ts";

// Convert an array of ics events to an ics calendar.
export function toIcsCalendar(events: EventAttributes[]): string {
  const { error, value } = createEvents(events);
  if (error) {
    throw error;
  }
  if (!value) {
    throw new Error(
      `Failed to create calendar using events: ${JSON.stringify(events)}`
    );
  }
  return normalizeIcs(value);
}
