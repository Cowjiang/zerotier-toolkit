const resolve = require('path').resolve
const {nextui} = require("@nextui-org/react")

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        resolve(__dirname, 'index.html'),
        resolve(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
        "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [nextui({
      themes: {
        light: {
          colors: {
            primary: '#F5A524'
          }
        },
        dark: {
          colors: {
            primary: '#F5A524'
          }
        }
      }
    })],
}
