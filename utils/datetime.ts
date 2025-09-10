export function formatDateTime(d: Date, opts?: Intl.DateTimeFormatOptions): string {
  try {
    const formatter = new Intl.DateTimeFormat(undefined, opts ?? {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return formatter.format(d);
  } catch {
    return d.toLocaleString();
  }
}

