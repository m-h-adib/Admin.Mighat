import localFont from "next/font/local";

export const vazirmatn = localFont({
  src: "../../public/fonts/vazirmatn-var.woff2",
  variable: "--font-vazirmatn",
  weight: "300 800",
  display: "swap",
  preload: true,
  fallback: ["Tahoma", "system-ui", "sans-serif"],
  adjustFontFallback: "Arial",
});
