#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { getLiturgicalCalendar } from "./getLiturgicalCalendar.ts";
import { toIcsCalendar } from "./toIcsCalendar.ts";
import { toIcsEvents } from "./toIcsEvents.ts";

// Current year
const year = new Date().getFullYear() + 1;

// Calendar object of solemnities, feasts, and memorials in the current year
const liturgicalCalendar = await getLiturgicalCalendar(year);

// ICS events
const events = toIcsEvents(liturgicalCalendar);

// ICS calendar
const icsCalendar = toIcsCalendar(events);

// Write ICS calendar to file
writeFileSync(`./liturgical-calendar-${year}.ics`, icsCalendar);
