const encoder = new TextEncoder();

export function calendarEscape(value) {
  return value.replaceAll('\\', '\\\\')
    .replace(/\r\n?|\n/g, '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;');
}

export function calendarFold(line) {
  const lines = [];
  let buffer = '';
  let size = 0;
  for (const character of line) {
    const length = encoder.encode(character).length;
    if (size + length > 75) {
      lines.push(buffer);
      buffer = ' ';
      size = 1;
    }
    buffer += character;
    size += length;
  }
  return [...lines, buffer].join('\r\n');
}

function basicTime(instant) {
  return instant.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function utcTime(date, time, minutes = 0) {
  return basicTime(new Date(Date.parse(date + 'T' + time + ':00+08:00') + minutes * 60000));
}

export function calendarPeriod(date) {
  return date.slice(0, 4) + '-' + Math.ceil(Number(date.slice(5, 7)) / 3);
}

export function confirmedShifts(schedule, name, period) {
  return schedule.filter(day => !day.canceled && calendarPeriod(day.date) === period &&
    day.roles.some(([, person]) => person === name));
}

export function renderCalendar(name, period, shifts, token, updatedAt) {
  const [year, quarter] = period.split('-');
  const title = 'CLC 安總班表 · ' + name + ' · ' + year + ' 年第 ' + quarter + ' 季';
  const stamp = basicTime(updatedAt);
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CLC//Duty Schedule//ZH', 'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:' + calendarEscape(title), 'X-WR-TIMEZONE:Asia/Taipei',
  ];
  for (const day of shifts) {
    const roles = day.roles.filter(([, person]) => person === name).map(([role]) => role).join('、');
    const title = 'CLC 安總 · ' + day.title + (day.end ? '' : '集合') + ' · ' + roles;
    const detail = [day.end ? '' : '班表只列集合時間，此項為集合提醒。', day.note].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      'UID:clc-duty-' + day.date + '-' + token + '@clc-security',
      'DTSTAMP:' + stamp,
      'DTSTART:' + utcTime(day.date, day.start),
      'DTEND:' + (day.end ? utcTime(day.date, day.end) : utcTime(day.date, day.start, 1)),
      'SUMMARY:' + calendarEscape(title),
      'LOCATION:' + calendarEscape(day.place),
      'DESCRIPTION:' + calendarEscape(detail),
      'STATUS:CONFIRMED', 'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(calendarFold).join('\r\n') + '\r\n';
}
