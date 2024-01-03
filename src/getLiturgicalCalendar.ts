import { Romcal, type LiturgicalDay } from "romcal";
import { UnitedStates_En } from "@romcal/calendar.united-states";

// Generate a calendar of solemnities, feasts, and memorials in the current year.
export async function getLiturgicalCalendar(
  year: number
): Promise<Record<string, LiturgicalDay>> {
  // Calendar object, unfiltered. Days can have multiple celebrations.
  const fullCalendar = await new Romcal({
    localizedCalendar: UnitedStates_En,
  }).generateCalendar(year);

  // Calendar object, filtered. Days have one celebration.
  const calendar: Record<string, LiturgicalDay> = {};

  // Filter out days that are not solemnities, feasts, or memorials.
  for (const [date, celebrations] of Object.entries(fullCalendar)) {
    const celebration = celebrations.filter(
      ({ rank, precedence, dateDef }) =>
        (["SOLEMNITY", "FEAST", "MEMORIAL"].includes(rank) &&
          precedence !== "WEEKDAY_OF_EASTER_OCTAVE_2") ||
        ["ASH_WEDNESDAY_2", "TRIDUUM_1"].includes(precedence) ||
        (precedence === "PRIVILEGED_SUNDAY_2" &&
          ["palmSunday", "divineMercySunday", "sundayOfAdvent"].includes(
            dateDef?.dateFn!
          ))
    )[0];
    if (celebration) {
      calendar[date] = celebration;
      console.log(date, celebration.name);
    }
  }
  return calendar;
}
