#!/usr/bin/env node
import romcal from "romcal";
import icalendar from "icalendar";
import uuid from "uuid/v4";

const isIncluded = ({ type, key }) => {
  switch (type) {
    case "HOLY_WEEK":
      return false;
    case "OPT_MEMORIAL":
      return ["saintBarnabasTheApostle"].includes(key); // Included because romcal misclassified this
    case "COMMEMORATION":
      return [
        "chairOfSaintPeterApostle", // Included because romcal misclassified this
        "saintPolycarpBishopAndMartyr", // Included as a Lenten Friday
        "saintFrancesOfRomeReligious", // Included as a Lenten Friday
        "saintTuribiusOfMogrovejoBishop" // Included as a Lenten Friday
      ].includes(key);
    default:
      return true;
  }
};

const isExcluded = ({ key }) => {
  return (
    [
      "saintCatherineOfSienaVirginAndDoctorOfTheChurch", // Excluded because romcal misclassified this
      "saintNorbertBishop", // Excluded because romcal misclassified this
      "easterMonday", // Excluded due to preference
      "easterTuesday", // Excluded due to preference
      "easterWednesday", // Excluded due to preference
      "easterThursday", // Excluded due to preference
      "easterFriday", // Excluded due to preference
      "easterSaturday", // Excluded due to preference
      "shroveMonday", // Excluded due to preference
      "shroveTuesday", // Excluded due to preference
      "thursdayAfterAshWednesday", // Excluded due to preference
      "saturdayAfterAshWednesday" // Excluded due to preference
    ].includes(key) ||
    /dayOfChristmastide/.test(key) || // Excluded due to preference
    /[0-9]*(st|nd|rd|th)DayInTheOctaveOfChristmas/.test(key) || // Excluded due to preference
    /dayBeforeEpiphany/.test(key) || // Excluded due to preference
    /OfThe[0-9]*(st|nd|rd|th|Th)WeekOf(OrdinaryTime|Advent|Easter)/.test(key) || // Excluded due to preference
    /^((?!(friday)).)*OfThe[0-9]*(st|nd|rd|th|Th)WeekOfLent/.test(key) || // Excluded due to preference
    /[0-9]*(st|nd|rd|th|Th)SundayOf(OrdinaryTime|Advent|Easter|Lent)/.test(key) // Excluded due to preference
  );
};

const withoutTitles = name =>
  name
    .split(",")
    .slice(0, Math.max(1, name.split(",").length - 1))
    .join("")
    .replace(
      /(Deacon and Martyr|Virgin and Martyr|Virgin and Doctor of The Church|the Venerable Priest and Doctor|the Apostle and Evangelist|Martyr(s)?|Bishop(s)?|Priest(s)?|Abbot|Religious|Pope|the Apostle|the Evangelist)/g,
      ""
    )
    .replace(/( )?(\/| or )/gi, "; ")
    .replace("  ", " ")
    .replace(/ $/, "");

const appendDay = name =>
  name.endsWith("s") ? `${name}’ Day` : `${name}’s Day`;

const getName = ({ key, name }) => {
  switch (true) {
    case /^fridayAfterAshWednesday$/.test(key): // Renamed to attach description
    case /^saintPolycarpBishopAndMartyr$/.test(key): // Renamed to attach description
    case /^fridayOfThe3rdWeekOfLent$/.test(key): // Renamed to attach description
    case /^saintFrancesOfRomeReligious$/.test(key): // Renamed to attach description
    case /^fridayOfThe5thWeekOfLent$/.test(key): // Renamed to attach description
    case /^saintTuribiusOfMogrovejoBishop$/.test(key): // Renamed to attach description
      return "Lenten Friday";
    case /^holySaturday$/.test(key): // Renamed due to preference
      return "Holy Saturday";
    case /^saintsJeanDeBrebeufAndIsaacJoguesPriestsAndCompanionsMartyrsSaintPaulOfTheCrossPriest$/.test(
      key
    ): // Renamed because romcal omits name
      return withoutTitles(
        "Saints John de Brébeuf and Isaac Jogues, Priests, and Companions, Martyrs"
      );
    case /^maryMotherOfGod$/.test(key): // Don’t rename
    case /^josephHusbandOfMary$/.test(key): // Don’t rename
      return name;
    case /^peterAndPaulApostles$/.test(key):
    case /^saint/.test(key):
      return appendDay(withoutTitles(name));
    default:
      return withoutTitles(name);
  }
};

const getDate = date =>
  new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );

const getDescription = key => {
  switch (key) {
    // Days of Fasting and Abstinence
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
    // Holy Days of Obligation
    case "maryMotherOfGod":
    case "ascension":
    case "assumption":
    case "allSaints":
    case "immaculateConception":
    case "christmas":
      return "Mass attendance is mandatory";
    // No special obligation
    default:
      return null;
  }
};

export const liturgicalCalendar = (year = new Date().getFullYear()) => {
  const calendar = new icalendar.iCalendar();
  romcal
    .calendarFor({ year, country: "unitedstates", locale: "en" })
    .filter(event => isIncluded(event) && !isExcluded(event))
    .forEach(({ name, moment, key }) => {
      const event = new icalendar.VEvent(uuid());
      event.setSummary(getName({ key, name }));
      event.addProperty("DTSTART", getDate(new Date(moment)), {
        VALUE: "DATE"
      });
      if (getDescription(key)) {
        event.setDescription(getDescription(key));
      }
      calendar.addComponent(event);
    });
  return calendar.toString();
};
