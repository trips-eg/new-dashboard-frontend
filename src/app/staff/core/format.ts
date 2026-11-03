// Formats of the app (core/utils/format.dart): Latin digits with separators in both languages.
const intFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
const money2Fmt = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtNum(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return '—';
  return v % 1 === 0 ? intFmt.format(v) : decFmt.format(v);
}

/** 9,800.00: settlement amounts with both decimals. */
export function fmtMoney2(v: number | null | undefined): string {
  return v == null ? '—' : money2Fmt.format(v);
}

/** 2,480,000 → 2.48M · 135,700 → 135.7K. */
export function fmtCompact(v: number | null | undefined): string {
  if (v == null) return '—';
  const a = Math.abs(v);
  let s: string;
  if (a >= 1e6) s = `${decFmt.format(a / 1e6)}M`;
  else if (a >= 1e4) s = `${decFmt.format(Math.round((a / 1e3) * 10) / 10)}K`;
  else s = intFmt.format(a);
  return v < 0 ? `−${s}` : s;
}

export function fmtPct(v: number | null | undefined, signed = false): string {
  if (v == null) return '—';
  const s = decFmt.format(Math.abs(v));
  return signed ? `${v >= 0 ? '+' : '−'}${s}%` : `${s}%`;
}

/** Dates from the backend are Cairo time without an offset: read as local. */
export function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string' || !v) return null;
  const d = new Date(v.endsWith('Z') ? v.slice(0, -1) : v);
  return isNaN(d.getTime()) ? null : d;
}

function locale(ar: boolean): string {
  return ar ? 'ar-EG-u-nu-latn' : 'en-GB';
}

/** "الخميس 5 نوفمبر" / "Thursday 5 November". */
export function fmtDay(d: Date | string | null | undefined, ar: boolean): string {
  const x = typeof d === 'string' ? parseDate(d) : d;
  return x ? new Intl.DateTimeFormat(locale(ar), { weekday: 'long', day: 'numeric', month: 'long' }).format(x) : '—';
}

/** 5 Nov 2026. */
export function fmtDate(d: Date | string | null | undefined, ar: boolean): string {
  const x = typeof d === 'string' ? parseDate(d) : d;
  return x ? new Intl.DateTimeFormat(locale(ar), { day: 'numeric', month: 'short', year: 'numeric' }).format(x) : '—';
}

/** 5/11/2026. */
export function fmtShortDate(d: Date | string | null | undefined): string {
  const x = typeof d === 'string' ? parseDate(d) : d;
  return x ? `${x.getDate()}/${x.getMonth() + 1}/${x.getFullYear()}` : '—';
}

/** 3:30 م / 3:30 PM. */
export function fmtTime(d: Date | string | null | undefined, ar: boolean): string {
  const x = typeof d === 'string' ? parseDate(d) : d;
  return x ? new Intl.DateTimeFormat(ar ? 'ar-EG-u-nu-latn' : 'en-US', { hour: 'numeric', minute: '2-digit' }).format(x) : '—';
}

export function fmtDateTime(d: Date | string | null | undefined, ar: boolean): string {
  const x = typeof d === 'string' ? parseDate(d) : d;
  return x ? `${fmtDate(x, ar)} · ${fmtTime(x, ar)}` : '—';
}

/** yyyy-MM-dd, as the API reads dates. */
export function apiDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export type DayGroup = 'today' | 'yesterday' | 'other';

export function dayGroup(d: Date, now = new Date()): DayGroup {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  if (day === today) return 'today';
  if (day === today - 86400000) return 'yesterday';
  return 'other';
}

/** Arabic-Indic and Persian digits become Latin digits before parsing. */
export function latinDigits(s: string): string {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  const persian = '۰۱۲۳۴۵۶۷۸۹';
  let out = '';
  for (const ch of s) {
    const i = arabic.indexOf(ch);
    const j = persian.indexOf(ch);
    out += i >= 0 ? String(i) : j >= 0 ? String(j) : ch;
  }
  return out.replace(/٫/g, '.').replace(/,/g, '');
}

export function parseAmount(s: string | number | null | undefined): number | null {
  if (s == null) return null;
  const n = parseFloat(latinDigits(String(s).trim()));
  return isNaN(n) ? null : n;
}

export function initials(name: string | null | undefined): string {
  const t = (name ?? '').trim();
  return t ? Array.from(t)[0] : '?';
}

/** A random key for Idempotency-Key headers (crypto.randomUUID needs https; this works on plain http too). */
export function uuid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });
}
