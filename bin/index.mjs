#!/usr/bin/env node
import { liturgicalCalendar } from "../lib";

const year = process.argv.slice(2)[0]
  ? parseInt(process.argv.slice(2)[0], 10)
  : null;
const calendar = liturgicalCalendar(year);
console.log(calendar);
