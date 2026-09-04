/**
 * Telugu / Andhra Pradesh cultural helpers: IST time-of-day, festival calendar,
 * script detection, romanisation heuristics.
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

const IST_OFFSET_MIN = 330;

/** Returns a Date whose UTC fields represent the current wall clock in IST. */
export function istNow(now: Date = new Date()): Date {
  return new Date(now.getTime() + IST_OFFSET_MIN * 60 * 1000);
}

export function istDateKey(now: Date = new Date()): string {
  return istNow(now).toISOString().slice(0, 10);
}

export function timeOfDay(now: Date = new Date()): TimeOfDay {
  const h = istNow(now).getUTCHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 16) return "afternoon";
  if (h >= 16 && h < 20) return "evening";
  return "night";
}

export const TIME_GREETING: Record<TimeOfDay, { te: string; en: string }> = {
  morning: { te: "శుభోదయం", en: "Good morning" },
  afternoon: { te: "నమస్కారం", en: "Good afternoon" },
  evening: { te: "శుభ సాయంత్రం", en: "Good evening" },
  night: { te: "శుభ రాత్రి", en: "Good night" },
};

export interface Festival {
  id: string;
  nameTe: string;
  nameEn: string;
  /** ISO dates (IST) on which the festival falls. Lunar festivals need yearly updates. */
  dates: string[];
  /** Fixed Gregorian month-day (MM-DD) for festivals that never move. */
  fixed?: string;
  greetingTe: string;
  note: string;
}

/**
 * Festival calendar for Andhra Pradesh. Fixed-date entries recur every year.
 * Lunar dates are listed explicitly (2026 verified against the Telugu panchangam
 * at authoring time; extend the arrays each year).
 */
export const FESTIVALS: Festival[] = [
  { id: "bhogi", nameTe: "భోగి", nameEn: "Bhogi", dates: [], fixed: "01-13", greetingTe: "భోగి శుభాకాంక్షలు!", note: "Bonfire of old things at dawn, bhogi pallu for children." },
  { id: "sankranti", nameTe: "మకర సంక్రాంతి", nameEn: "Makara Sankranti", dates: [], fixed: "01-14", greetingTe: "సంక్రాంతి శుభాకాంక్షలు!", note: "Harvest festival: muggulu, gobbemmalu, Gangireddu, kites, ariselu." },
  { id: "kanuma", nameTe: "కనుమ", nameEn: "Kanuma", dates: [], fixed: "01-15", greetingTe: "కనుమ శుభాకాంక్షలు!", note: "Day for cattle and farm animals." },
  { id: "republic", nameTe: "గణతంత్ర దినోత్సవం", nameEn: "Republic Day", dates: [], fixed: "01-26", greetingTe: "గణతంత్ర దినోత్సవ శుభాకాంక్షలు!", note: "National holiday." },
  { id: "ugadi", nameTe: "ఉగాది", nameEn: "Ugadi (Telugu New Year)", dates: ["2026-03-19", "2027-04-07"], greetingTe: "ఉగాది శుభాకాంక్షలు!", note: "Ugadi pachadi with six tastes, panchanga sravanam." },
  { id: "sriramanavami", nameTe: "శ్రీరామనవమి", nameEn: "Sri Rama Navami", dates: ["2026-03-27", "2027-04-15"], greetingTe: "శ్రీరామనవమి శుభాకాంక్షలు!", note: "Bhadrachalam kalyanam, panakam and vadapappu." },
  { id: "independence", nameTe: "స్వాతంత్ర్య దినోత్సవం", nameEn: "Independence Day", dates: [], fixed: "08-15", greetingTe: "స్వాతంత్ర్య దినోత్సవ శుభాకాంక్షలు!", note: "National holiday." },
  { id: "telugu-day", nameTe: "తెలుగు భాషా దినోత్సవం", nameEn: "Telugu Language Day", dates: [], fixed: "08-29", greetingTe: "తెలుగు భాషా దినోత్సవ శుభాకాంక్షలు!", note: "Birthday of Gidugu Venkata Ramamurthy, champion of spoken Telugu." },
  { id: "vinayaka-chavithi", nameTe: "వినాయక చవితి", nameEn: "Vinayaka Chavithi", dates: ["2026-09-14", "2027-09-04"], greetingTe: "వినాయక చవితి శుభాకాంక్షలు!", note: "Clay Ganesha, undrallu, patri pooja." },
  { id: "dasara", nameTe: "దసరా", nameEn: "Dasara (Vijayadasami)", dates: ["2026-10-20", "2027-10-09"], greetingTe: "దసరా శుభాకాంక్షలు!", note: "Vijayawada Kanaka Durga temple, bommala koluvu, jammi chettu." },
  { id: "atla-taddi", nameTe: "అట్ల తద్ది", nameEn: "Atla Taddi", dates: ["2026-10-29", "2027-10-18"], greetingTe: "అట్ల తద్ది శుభాకాంక్షలు!", note: "Andhra festival: swings, gorintaku, attlu for the moon." },
  { id: "ap-formation", nameTe: "ఆంధ్రప్రదేశ్ అవతరణ దినోత్సవం", nameEn: "Andhra Pradesh Formation Day", dates: [], fixed: "11-01", greetingTe: "ఆంధ్రప్రదేశ్ అవతరణ దినోత్సవ శుభాకాంక్షలు!", note: "State day (1956)." },
  { id: "deepavali", nameTe: "దీపావళి", nameEn: "Deepavali", dates: ["2026-11-08", "2027-10-28"], greetingTe: "దీపావళి శుభాకాంక్షలు!", note: "Lamps, crackers, sweets." },
  { id: "kartika-pournami", nameTe: "కార్తీక పౌర్ణమి", nameEn: "Kartika Pournami", dates: ["2026-11-24", "2027-11-13"], greetingTe: "కార్తీక పౌర్ణమి శుభాకాంక్షలు!", note: "365-wick lamps, river baths, vanabhojanalu." },
  { id: "christmas", nameTe: "క్రిస్మస్", nameEn: "Christmas", dates: [], fixed: "12-25", greetingTe: "క్రిస్మస్ శుభాకాంక్షలు!", note: "Widely celebrated across coastal Andhra." },
];

/** Festivals happening today or within the next `withinDays` days (IST). */
export function upcomingFestivals(now: Date = new Date(), withinDays = 3): Array<Festival & { daysAway: number }> {
  const today = istNow(now);
  const todayKey = today.toISOString().slice(0, 10);
  const out: Array<Festival & { daysAway: number }> = [];
  for (const f of FESTIVALS) {
    const candidates = [...f.dates];
    if (f.fixed) {
      const y = today.getUTCFullYear();
      candidates.push(`${y}-${f.fixed}`, `${y + 1}-${f.fixed}`);
    }
    for (const d of candidates) {
      const days = Math.round((Date.parse(d + "T00:00:00Z") - Date.parse(todayKey + "T00:00:00Z")) / 86400000);
      if (days >= 0 && days <= withinDays) {
        out.push({ ...f, daysAway: days });
        break;
      }
    }
  }
  return out.sort((a, b) => a.daysAway - b.daysAway);
}

const TELUGU_RANGE = /[ఀ-౿]/;

export function hasTeluguScript(text: string): boolean {
  return TELUGU_RANGE.test(text);
}

/** Rough script-based language guess for text the user typed. */
export function guessLanguage(text: string): "te" | "en" | "mixed" {
  const teluguChars = (text.match(/[ఀ-౿]/g) ?? []).length;
  const latinChars = (text.match(/[A-Za-z]/g) ?? []).length;
  if (teluguChars > 0 && latinChars > 0) return "mixed";
  if (teluguChars > 0) return "te";
  return "en";
}

/** Common Tenglish tokens used to detect romanised Telugu typed in Latin script. */
const TENGLISH_HINTS = ["nenu", "nuvvu", "meeru", "ela", "unnav", "unnaru", "bagunnava", "bagunnara", "cheppu", "enti", "emi", "ledu", "kadu", "avunu", "chala", "roju", "ninna", "repu", "inka", "kuda", "andi", "ra ", "amma", "nanna"];

export function looksLikeTenglish(text: string): boolean {
  const lower = ` ${text.toLowerCase()} `;
  let hits = 0;
  for (const h of TENGLISH_HINTS) if (lower.includes(` ${h}`)) hits++;
  return hits >= 1;
}
