#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { getLiturgicalCalendar } from "./getLiturgicalCalendar.js";
import { toIcsCalendar } from "./toIcsCalendar.js";
import { toIcsEvents } from "./toIcsEvents.js";

// Current year
const year = new Date().getFullYear();

// Calendar object of solemnities, feasts, and memorials in the current year
const liturgicalCalendar = await getLiturgicalCalendar(year);

// ICS events
const events = toIcsEvents(liturgicalCalendar);

// ICS calendar
const icsCalendar = toIcsCalendar(events);

// Write ICS calendar to file
writeFileSync(`./liturgical-calendar-${year}.ics`, icsCalendar);
