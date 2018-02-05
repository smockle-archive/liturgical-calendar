#!/usr/bin/env node
require = require("@std/esm")(module);
module.exports = {
  liturgicalCalendar: require("./index.mjs").liturgicalCalendar
};
