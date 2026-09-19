import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#182642",
          soft: "#233457"
        },
        paper: {
          DEFAULT: "#F6F3EC",
          soft: "#ECE7DA"
        },
        ink: {
          DEFAULT: "#1C2230",
          soft: "#5B6070"
        },
        amber: "#E8A93A",
        signal: {
          granted: "#2E7D4F",
          denied: "#B23A2E"
        },
        line: "rgba(28,34,48,0.14)"
      },
      fontFamily: {
        head: ["'Space Grotesk'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      borderRadius: {
        card: "6px"
      }
    }
  },
  plugins: []
};

export default config;
