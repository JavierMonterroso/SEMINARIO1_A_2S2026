const dateFormat = new Intl.DateTimeFormat('es-GT', { dateStyle: 'medium', timeStyle: 'short' });
const timeFormat = new Intl.DateTimeFormat('es-GT', { timeStyle: 'short' });

export function formatDate(value) {
  return dateFormat.format(new Date(value));
}

export function formatTime(value) {
  return timeFormat.format(new Date(value));
}
