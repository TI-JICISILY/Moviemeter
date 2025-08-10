const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://moviemeter-y55x.vercel.app/",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    video: true,
    videoCompression: 32,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    experimentalStudio: true,
    experimentalModifyObstructiveThirdPartyCode: true,
  },
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack',
    },
  },
})


