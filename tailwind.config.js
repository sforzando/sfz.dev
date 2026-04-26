// Extends Congo's Tailwind config without modifying the submodule.
// build-css task points -c flag here instead of themes/congo/tailwind.config.js.
const congoConfig = require("./themes/congo/tailwind.config.js")

module.exports = {
  ...congoConfig,
  theme: {
    ...congoConfig.theme,
    extend: {
      ...congoConfig.theme.extend,
      fontFamily: {
        // Tuple format: [fontStack[], settingsObject] — required by Tailwind v3.3+
        sans: [
          [
            '"Noto Sans JP"',
            "ui-sans-serif",
            "system-ui",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
            '"Noto Color Emoji"',
          ],
          { fontFeatureSettings: '"palt"' },
        ],
      },
    },
  },
}
