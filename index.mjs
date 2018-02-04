#!/usr/bin/env node
import romcal from "romcal";
import icalendar from "icalendar";
import uuid from "uuid/v4";

const calendar = new icalendar.iCalendar();
romcal
  .calendarFor({ year: 2018, country: "unitedstates", locale: "en" })
  .filter(({ type }) =>
    [
      "SOLEMNITY",
      "OPT_MEMORIAL",
      "MEMORIAL",
      "FEAST",
      "SUNDAY",
      "COMMEMORATION",
      "WEEKDAY",
      "TRIDUUM"
    ].includes(type)
  )
  .filter(
    ({ key, type }) =>
      !(type === "OPT_MEMORIAL" && !["saintBarnabasTheApostle"].includes(key))
  )
  .filter(
    ({ key, type }) =>
      !(
        type === "COMMEMORATION" &&
        ![
          "chairOfSaintPeterApostle",
          "saintPolycarpBishopAndMartyr",
          "saintFrancesOfRomeReligious",
          "saintTuribiusOfMogrovejoBishop"
        ].includes(key)
      )
  )
  .filter(
    ({ key }) =>
      ![
        "saintCatherineOfSienaVirginAndDoctorOfTheChurch",
        "saintNorbertBishop",
        "easterMonday",
        "easterTuesday",
        "easterWednesday",
        "easterThursday",
        "easterFriday",
        "easterSaturday"
      ].includes(key)
  )
  .filter(({ name }) => !name.includes("of Ordinary Time"))
  .filter(({ name }) => !name.includes("before Epiphany"))
  .filter(({ name }) => !name.includes("of Christmastide"))
  .filter(({ name }) => !name.includes("Shrove"))
  .filter(
    ({ name }) =>
      !(name.includes("after Ash Wednesday") && !name.includes("Friday"))
  )
  .filter(({ name }) => !(name.includes("of Lent") && !name.includes("Friday")))
  .filter(({ name }) => !name.includes("of Easter"))
  .filter(({ name }) => !name.includes("of Advent"))
  .filter(({ name }) => !name.includes("the Octave of Christmas"))
  .forEach(({ name, moment, key }) => {
    const event = new icalendar.VEvent(uuid());
    const summary = (key => {
      switch (key) {
        case "fridayAfterAshWednesday":
        case "saintPolycarpBishopAndMartyr":
        case "fridayOfThe3rdWeekOfLent":
        case "saintFrancesOfRomeReligious":
        case "fridayOfThe5thWeekOfLent":
        case "saintTuribiusOfMogrovejoBishop":
          return "Lenten Friday";
        default:
          return name;
      }
    })(key);
    event.setSummary(summary);
    const date = (date =>
      new Date(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      ))(new Date(moment));
    event.addProperty("DTSTART", date, { VALUE: "DATE" });
    const description = (key => {
      switch (key) {
        case "ashWednesday":
        case "fridayAfterAshWednesday":
        case "saintPolycarpBishopAndMartyr":
        case "fridayOfThe3rdWeekOfLent":
        case "saintFrancesOfRomeReligious":
        case "fridayOfThe5thWeekOfLent":
        case "saintTuribiusOfMogrovejoBishop":
        case "goodFriday":
          return "Fasting and abstaining from meat is mandatory";
        case "holySaturday":
          return "Fasting and abstaining from meat is recommended";
        case "maryMotherOfGod":
        case "ascension":
        case "assumption":
        case "allSaints":
        case "immaculateConception":
        case "christmas":
          return "Mass attendance is mandatory";
        default:
          return null;
      }
    })(key);
    if (description) {
      event.setDescription(description);
    }
    calendar.addComponent(event);
  });
console.log(calendar.toString());
