import tokens from "./tokens.json";
const root = document.documentElement;
const theme = matchMedia("(prefers-color-scheme: light)").matches ? tokens.light : tokens.dark;
for (const [k, v] of Object.entries(theme)) root.style.setProperty(`--${k}`, v);
document.getElementById("app")!.textContent = "Rally";
