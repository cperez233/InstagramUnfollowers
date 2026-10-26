/* editorial-ui · Cristian Pérez · cristianperez.me */
import { Language } from "./i18n";

// "2 days ago", "yesterday", "5 minutes ago" in the app's language.
export function formatWhen(timestamp: number, lang: Language): string {
  const seconds = Math.round((timestamp - Date.now()) / 1000);
  const units: readonly [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const format = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) {
      return format.format(Math.round(seconds / size), unit);
    }
  }
  return format.format(0, "minute");
}

export function formatCount(value: number, lang: Language): string {
  return new Intl.NumberFormat(lang).format(value);
}
