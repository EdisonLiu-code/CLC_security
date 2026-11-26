import { adminResponse } from './auth.mjs';
import { publishedRoster } from './editor-data.mjs';
import { calendarPeriod, confirmedShifts, renderCalendar } from '../.private/roster-calendar.mjs';
import { shell, page, browserSource } from '../.private/roster-view.mjs';

const encoder = new TextEncoder();
const feedPattern = /^\/calendar\/(20\d{2}-[1-4])\/([a-f0-9]{64})\.ics$/;
const initialRosterPublishedAt = '2026-11-23T00:00:00Z';

function calendarKey(secret, use) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [use]);
}

function calendarIdentity(period, name) {
  return encoder.encode(JSON.stringify(['clc-roster-calendar', period, name]));
}

async function calendarLinks(secret, members, schedule) {
  const assigned = new Map();
  for (const day of schedule) {
    if (day.canceled) continue;
    const period = calendarPeriod(day.date);
    if (!assigned.has(period)) assigned.set(period, new Set());
    for (const [, name] of day.roles) assigned.get(period).add(name);
  }
  const key = await calendarKey(secret, 'sign');
  const periods = await Promise.all([...assigned].map(async ([period, names]) => {
    const links = await Promise.all(members.map(async name => {
      if (!names.has(name)) return null;
      const signature = await crypto.subtle.sign('HMAC', key, calendarIdentity(period, name));
      const token = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
      return '/public/calendar/' + period + '/' + token + '.ics';
    }));
    return [period, links];
  }));
  return Object.fromEntries(periods);
}

export async function roster(request, env, url, headers, embedded) {
  const { members, schedule } = await publishedRoster(env.CLC_DB);
  if (!members.length || !schedule.length) return adminResponse('班表暫時無法載入。', 503, headers);
  if (request.method === 'HEAD') return adminResponse(null, 200, headers);
  const feedLinks = await calendarLinks(env.CLC_VIEW_LINK_KEY, members, schedule);
  const payload = JSON.stringify({ members, schedule, feedLinks }).replaceAll('<', '\\u003c');
  const layout = embedded ? '(' + browserSource.reportEmbeddedHeight + ')(' + JSON.stringify(url.origin) + ');' : '';
  const script = '<script>' + layout + '(' + browserSource.runPage + ')(' + payload + ',' + browserSource.calendarPeriod + ');</script>';
  return adminResponse(shell(page, script, embedded), 200, headers);
}

export async function rosterCalendar(request, env, path, headers) {
  const missing = () => adminResponse('找不到這個個人班表。', 404, headers);
  const match = feedPattern.exec(path);
  if (!match) return missing();
  const [, period, token] = match;
  const signature = Uint8Array.from(token.match(/../g), hex => Number.parseInt(hex, 16));
  const [key, { members, schedule }] = await Promise.all([
    calendarKey(env.CLC_VIEW_LINK_KEY, 'verify'),
    publishedRoster(env.CLC_DB),
  ]);
  const matches = await Promise.all(members.map(name =>
    crypto.subtle.verify('HMAC', key, signature, calendarIdentity(period, name))));
  const name = members[matches.indexOf(true)];
  if (!name) return missing();
  const calendarHeaders = { ...headers, 'content-type': 'text/calendar; charset=utf-8' };
  if (request.method === 'HEAD') return adminResponse(null, 200, calendarHeaders);
  const publication = await env.CLC_DB.prepare(
    "SELECT changed_at FROM editor_history WHERE kind = 'roster' ORDER BY version DESC LIMIT 1",
  ).first();
  const updatedAt = new Date(publication?.changed_at ?? initialRosterPublishedAt);
  const shifts = confirmedShifts(schedule, name, period);
  return adminResponse(renderCalendar(name, period, shifts, token, updatedAt), 200, calendarHeaders);
}
