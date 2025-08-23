export function timeHM(input: Date | string | number) {
  const d = new Date(input);
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}

export function relativeDayOrTime(input: Date | string | number) {
  const d = new Date(input);
  const now = new Date();

  const midnight = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const d0 = midnight(d).getTime();
  const n0 = midnight(now).getTime();
  const daysDiff = Math.round((n0 - d0) / 86_400_000);

  if (daysDiff === 0) return timeHM(d);
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff > 1 && daysDiff <= 6) {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(d);
  }

  const sameYear = d.getFullYear() === now.getFullYear();
  return new Intl.DateTimeFormat(undefined, sameYear
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: 'numeric' }
  ).format(d);
}

export function dayOrTime(input: Date | string | number) {
  const d = new Date(input);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? timeHM(d)
    : new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
}
