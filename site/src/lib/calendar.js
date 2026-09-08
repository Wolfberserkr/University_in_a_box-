/* Date logic for the term. All dates are plain YYYY-MM-DD, compared as strings
 * where possible and as local-noon Date objects where arithmetic is needed -
 * noon so a daylight-saving shift can never move a day across a boundary.
 */

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export function toISO(date) {
  const p = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function daysBetween(a, b) {
  return Math.round((toDate(b) - toDate(a)) / 86400000);
}

export function fmt(iso, opts = { day: 'numeric', month: 'short' }) {
  if (!iso) return '';
  return toDate(iso).toLocaleDateString(undefined, opts);
}

export function fmtLong(iso) {
  return fmt(iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function fmtRange(a, b) {
  return `${fmt(a)} – ${fmt(b)}`;
}

/* Where the program is on a given date.
 *   phase 'pre'  - before week 1
 *   phase 'in'   - inside the term; week is 1..14
 *   phase 'post' - after week 14
 */
export function locate(weeks, iso, terms = []) {
  if (!weeks.length) return { phase: 'pre', week: null, dayIndex: 0, block: null };
  const first = weeks[0];
  const last = weeks[weeks.length - 1];

  /* Which of the year's six blocks today falls in. REGISTRAR.md's calendar
     carries all of them; the site used to read only Term A, so from 14 December
     onward every page rendered a term that had ended - a scope-cut warning about
     closed weeks, an acquisition list from September, and a masthead naming the
     wrong term for thirty-eight of the fifty-two weeks. */
  const dated = terms.filter((t) => t.start && t.end);
  const block = dated.find((t) => iso >= t.start && iso <= t.end) || null;
  const nextBlock = dated.find((t) => t.start > iso) || null;
  // past every block in the registrar's calendar: the programme is over, which
  // is a different thing from "between blocks" and must not read as Term A
  const afterAll = dated.length > 0 && iso > dated[dated.length - 1].end;

  if (iso < first.start) {
    return { phase: 'pre', week: null, daysUntil: daysBetween(iso, first.start), next: first, block, nextBlock, afterAll };
  }
  if (iso > last.end) {
    return { phase: 'post', week: null, daysSince: daysBetween(last.end, iso), block, nextBlock, afterAll };
  }
  const week = weeks.find((w) => iso >= w.start && iso <= w.end) || first;
  const dayIndex = daysBetween(week.start, iso); // 0 = Monday
  return { phase: 'in', week, dayIndex, weekday: DAY_NAMES[toDate(iso).getDay()], block, nextBlock, afterAll };
}

/* Weeks whose Sunday is already past, relative to `iso`. These are the weeks
 * that can be slipped - a week still running cannot be late yet. */
export function elapsedWeeks(weeks, iso) {
  return weeks.filter((w) => w.end < iso);
}
