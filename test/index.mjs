import test from "tape";
import fs from "fs";
import icalendar from "icalendar";
import { liturgicalCalendar } from "../lib";

const getEvents = unparsedCalendar => {
  return icalendar
    .parse_calendar(unparsedCalendar)
    .events()
    .map(({ properties }) => ({
      DTSTART: properties.DTSTART,
      SUMMARY: properties.SUMMARY,
      DESCRIPTION: properties.DESCRIPTION
    }));
};

const generateTest = year =>
  test(`${year}`, t => {
    // t.plan(2);
    const actual = getEvents(liturgicalCalendar(year));
    const expected = getEvents(fs.readFileSync(`data/${year}.ics`, "utf-8"));
    t.equal(actual.length, expected.length);
    actual.forEach((x, i) => t.deepEqual(x, expected[i]));
    t.end();
    // t.deepEqual(actual, expected);
  });

generateTest(2018);
generateTest(2019);
generateTest(2020);
