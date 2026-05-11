/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0D0D0F",
        surface: "#14141A",
        accent: "#E040FB",
        cyan: "#00E5FF",
        card: "#1A1A24",
      },
      fontFamily: {
        heading: ["BebasNeue_400Regular"],
        body: ["Nunito_400Regular", "Nunito_700Bold"],
      },
    },
  },
  plugins: [],
};
