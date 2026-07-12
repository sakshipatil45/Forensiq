/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "hsl(224, 71%, 4%)",
        foreground: "hsl(210, 40%, 98%)",
        card: "hsl(224, 71%, 7%)",
        "card-foreground": "hsl(210, 40%, 98%)",
        popover: "hsl(224, 71%, 4%)",
        "popover-foreground": "hsl(210, 40%, 98%)",
        primary: "hsl(217.2, 91.2%, 59.8%)",
        "primary-foreground": "hsl(222.2, 47.4%, 11.2%)",
        secondary: "hsl(222.2, 47.4%, 11.2%)",
        "secondary-foreground": "hsl(210, 40%, 98%)",
        muted: "hsl(223, 47%, 11%)",
        "muted-foreground": "hsl(215.4, 16.3%, 56.9%)",
        accent: "hsl(216, 34%, 17%)",
        "accent-foreground": "hsl(210, 40%, 98%)",
        destructive: "hsl(0, 84.2%, 60.2%)",
        "destructive-foreground": "hsl(210, 40%, 98%)",
        border: "hsl(217.2, 32.6%, 17.5%)",
        input: "hsl(217.2, 32.6%, 17.5%)",
        ring: "hsl(224.3, 76.3%, 48%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
}
