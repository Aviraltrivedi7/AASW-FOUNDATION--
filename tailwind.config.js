/** @type {import('tailwindcss').Config} */
module.exports = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "primary-container": "#869cf0",
                    "outline": "#767576",
                    "on-secondary": "#360055",
                    "error-dim": "#d73357",
                    "on-secondary-fixed": "#540081",
                    "on-surface": "#ffffff",
                    "error": "#ff6e84",
                    "inverse-primary": "#445aa9",
                    "secondary-fixed": "#eac4ff",
                    "error-container": "#a70138",
                    "on-secondary-container": "#eac2ff",
                    "on-background": "#ffffff",
                    "tertiary-container": "#7daffc",
                    "inverse-surface": "#fcf8f9",
                    "surface-container-lowest": "#000000",
                    "surface-container-high": "#201f21",
                    "on-tertiary": "#00396f",
                    "tertiary-fixed": "#80b2fe",
                    "on-secondary-fixed-variant": "#7725aa",
                    "surface-variant": "#262627",
                    "primary": "#94aaff",
                    "on-primary-fixed": "#000f40",
                    "surface-container": "#19191b",
                    "on-error-container": "#ffb2b9",
                    "background": "#0e0e0f",
                    "surface-tint": "#94aaff",
                    "secondary-dim": "#cb7bff",
                    "on-error": "#490013",
                    "inverse-on-surface": "#565556",
                    "tertiary-dim": "#6fa2ed",
                    "on-tertiary-fixed": "#001835",
                    "tertiary-fixed-dim": "#72a5f0",
                    "on-surface-variant": "#adaaab",
                    "on-primary": "#072776",
                    "primary-fixed-dim": "#869cf0",
                    "surface-container-highest": "#262627",
                    "secondary-fixed-dim": "#e2b1ff",
                    "secondary": "#cb7bff",
                    "on-tertiary-fixed-variant": "#003970",
                    "on-primary-container": "#001b60",
                    "on-tertiary-container": "#002e5d",
                    "tertiary": "#94bdff",
                    "surface-container-low": "#131314",
                    "surface": "#0e0e0f",
                    "on-primary-fixed-variant": "#16307f",
                    "surface-bright": "#2c2c2d",
                    "primary-fixed": "#94aaff",
                    "primary-dim": "#869cf0",
                    "outline-variant": "#484849",
                    "secondary-container": "#6c169f",
                    "surface-dim": "#0e0e0f"
            },
            "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "headline": ["Manrope"],
                    "body": ["Manrope"],
                    "label": ["Space Grotesk"]
            }
          }
        }
      ,
  content: ["./aasw-pro/**/*.html", "./aasw-pro/**/*.js"]
};
