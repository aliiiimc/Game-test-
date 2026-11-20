import { loadFont as loadGoogleFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadLocalFont } from "@remotion/fonts";
import { staticFile } from "remotion";

/**
 * Police : Montserrat.
 * - Par défaut : chargée depuis Google Fonts via @remotion/google-fonts.
 * - Avec la variable d'environnement REMOTION_FONT_SOURCE=local : chargée
 *   depuis public/fonts/ (utile hors-ligne ou derrière un proxy/pare-feu).
 */
const useLocal = process.env.REMOTION_FONT_SOURCE === "local";

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF";

const LOCAL_FAMILY = "Montserrat";

let family = LOCAL_FAMILY;

if (useLocal) {
  loadLocalFont({
    family: LOCAL_FAMILY,
    url: staticFile("fonts/Montserrat-latin.woff2"),
    weight: "100 900",
    unicodeRange: LATIN,
  });
  loadLocalFont({
    family: LOCAL_FAMILY,
    url: staticFile("fonts/Montserrat-latin-ext.woff2"),
    weight: "100 900",
    unicodeRange: LATIN_EXT,
  });
} else {
  family = loadGoogleFont("normal", {
    weights: ["500", "700", "800", "900"],
    subsets: ["latin", "latin-ext"],
  }).fontFamily;
}

export const FONT_FAMILY = `${family}, Arial, sans-serif`;
