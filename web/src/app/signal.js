import { fill } from '../i18n'

/**
 * Vertaalt de redenen uit getSubjectSignal naar leesbare zinnen.
 * Bundel noemt wat het ziet en laat het oordeel aan de student, dus hier
 * staan feiten en geen adviezen.
 */
export function signalLine(reason, t) {
  const r = t.app.signal.reasons

  if (reason.kind === 'overdue') {
    return fill(reason.value === 1 ? r.overdue : r.overduePlural, { value: reason.value })
  }
  if (reason.kind === 'attendance') {
    return fill(r.attendance, { value: reason.value, attended: reason.attended, counted: reason.counted })
  }
  return fill(r[reason.kind], { value: reason.value })
}
