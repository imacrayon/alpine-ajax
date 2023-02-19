const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    retries: 1, // This is a workaround for flaky network tests
    specPattern: 'tests/*.cy.js',
    supportFile: false,
  },
  downloadsFolder: 'tests/downloads',
  fixturesFolder: false,
  video: false,
  screenshotOnRunFailure: false,
});
