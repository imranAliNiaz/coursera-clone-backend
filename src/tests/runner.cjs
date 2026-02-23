#!/usr/bin/env node
"use strict";

const Mocha = require("mocha");
const path = require("path");

const mocha = new Mocha({
  timeout: 15000,
  reporter: "spec",
});

mocha.addFile(path.join(__dirname, "../dist-test/tests/api.test.js"));

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
