const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/*.cy.js',
    supportFile: false,
  },
  downloadsFolder: 'tests/downloads',
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
});
