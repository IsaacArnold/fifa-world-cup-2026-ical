const { test } = require('node:test');
const assert = require('node:assert/strict');
const { slugify, formatUTCDate, matchToVEvent, buildCalendar } = require('../src/ical.js');

const SAMPLE_MATCH = {
  matchNumber: 1,
  stage: 'Group Stage',
  group: 'A',
  homeTeam: 'Mexico',
  awayTeam: 'Ecuador',
  kickoffUTC: '2026-06-11T20:00:00Z',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  country: 'Mexico',
};

test('slugify converts name to kebab-case', () => {
  assert.equal(slugify('United States'), 'united-states');
  assert.equal(slugify('Korea Republic'), 'korea-republic');
  assert.equal(slugify('México'), 'm-xico'); // non-ASCII stripped
  assert.equal(slugify('Mexico'), 'mexico');
});

test('formatUTCDate converts ISO string to iCal UTC format', () => {
  assert.equal(formatUTCDate('2026-06-11T20:00:00Z'), '20260611T200000Z');
  assert.equal(formatUTCDate('2026-07-19T18:00:00.000Z'), '20260719T180000Z');
});

test('matchToVEvent produces correct VEVENT block', () => {
  const vevent = matchToVEvent(SAMPLE_MATCH);
  assert.ok(vevent.includes('BEGIN:VEVENT'));
  assert.ok(vevent.includes('END:VEVENT'));
  assert.ok(vevent.includes('UID:fifa2026-match-001@fifa-world-cup-2026'));
  assert.ok(vevent.includes('DTSTART:20260611T200000Z'));
  assert.ok(vevent.includes('DTEND:20260611T220000Z'));
  assert.ok(vevent.includes('SUMMARY:Group A: 🇲🇽 Mexico vs 🇪🇨 Ecuador — Mexico City'));
});

test('matchToVEvent uses stage name when no group', () => {
  const match = { ...SAMPLE_MATCH, stage: 'Quarterfinals', group: null };
  const vevent = matchToVEvent(match);
  assert.ok(vevent.includes('SUMMARY:Quarterfinals: 🇲🇽 Mexico vs 🇪🇨 Ecuador — Mexico City'));
});

test('buildCalendar wraps events in VCALENDAR', () => {
  const cal = buildCalendar([SAMPLE_MATCH]);
  assert.ok(cal.startsWith('BEGIN:VCALENDAR'));
  assert.ok(cal.endsWith('END:VCALENDAR'));
  assert.ok(cal.includes('BEGIN:VEVENT'));
  assert.ok(cal.includes('VERSION:2.0'));
});

test('buildCalendar includes all matches', () => {
  const match2 = { ...SAMPLE_MATCH, matchNumber: 2 };
  const cal = buildCalendar([SAMPLE_MATCH, match2]);
  const count = (cal.match(/BEGIN:VEVENT/g) || []).length;
  assert.equal(count, 2);
});

test('matchToVEvent omits flag for placeholder team names', () => {
  const match = {
    ...SAMPLE_MATCH,
    homeTeam: 'Group A Winner',
    awayTeam: 'Group B Winner',
  };
  const vevent = matchToVEvent(match);
  assert.ok(vevent.includes('Group A Winner vs Group B Winner'));
  assert.ok(!vevent.includes('undefined'));
});
