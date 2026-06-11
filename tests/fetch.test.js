const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeMatches } = require('../src/fetch.js');

const MOCK_ROUNDS = {
  rounds: [
    {
      name: 'Matchday 1',
      matches: [
        {
          num: 1,
          date: '2026-06-11',
          time: '15:00',
          group: 'Group A',
          team1: { name: 'Mexico', code: 'MEX' },
          team2: { name: 'Ecuador', code: 'ECU' },
          stadium: { key: 'azteca', name: 'Estadio Azteca' },
          city: 'Mexico City',
        },
        {
          num: 2,
          date: '2026-06-11',
          time: '18:00',
          group: 'Group A',
          team1: { name: 'USA', code: 'USA' },
          team2: { name: 'Canada', code: 'CAN' },
          stadium: { key: 'metlife', name: 'MetLife Stadium' },
          city: 'East Rutherford',
        },
      ],
    },
    {
      name: 'Quarterfinals',
      matches: [
        {
          num: 89,
          date: '2026-07-03',
          time: '15:00',
          team1: { name: 'TBD' },
          team2: { name: 'TBD' },
          stadium: { key: 'sofi-stadium', name: 'SoFi Stadium' },
          city: 'Inglewood',
        },
      ],
    },
  ],
};

test('normalizeMatches returns correct count', () => {
  const matches = normalizeMatches(MOCK_ROUNDS);
  assert.equal(matches.length, 3);
});

test('normalizeMatches maps group stage match correctly', () => {
  const matches = normalizeMatches(MOCK_ROUNDS);
  const m = matches[0];
  assert.equal(m.matchNumber, 1);
  assert.equal(m.stage, 'Group Stage');
  assert.equal(m.group, 'A');
  assert.equal(m.homeTeam, 'Mexico');
  assert.equal(m.awayTeam, 'Ecuador');
  assert.equal(m.venue, 'Estadio Azteca');
  assert.equal(m.city, 'Mexico City');
  // Azteca is America/Mexico_City (UTC-6, no DST since 2023)
  assert.equal(m.kickoffUTC, '2026-06-11T21:00:00.000Z');
});

test('normalizeMatches converts timezone for US venue', () => {
  const matches = normalizeMatches(MOCK_ROUNDS);
  const m = matches[1];
  // MetLife is America/New_York (UTC-4 in June)
  assert.equal(m.kickoffUTC, '2026-06-11T22:00:00.000Z');
});

test('normalizeMatches maps knockout round stage correctly', () => {
  const matches = normalizeMatches(MOCK_ROUNDS);
  const m = matches[2];
  assert.equal(m.stage, 'Quarterfinals');
  assert.equal(m.group, null);
  assert.equal(m.matchNumber, 89);
});

test('normalizeMatches handles missing team names as TBD', () => {
  const rounds = {
    rounds: [{
      name: 'Semifinals',
      matches: [{
        num: 97,
        date: '2026-07-10',
        time: '20:00',
        stadium: { key: 'metlife', name: 'MetLife Stadium' },
        city: 'East Rutherford',
      }],
    }],
  };
  const matches = normalizeMatches(rounds);
  assert.equal(matches[0].homeTeam, 'TBD');
  assert.equal(matches[0].awayTeam, 'TBD');
});

const { normalizeESPNData } = require('../src/fetch.js');

const ESPN_MOCK = {
  events: [
    {
      id: '1',
      date: '2026-06-11T19:00Z',
      name: 'South Africa at Mexico',
      season: { year: 2026, slug: 'group-stage' },
      competitions: [{
        venue: { fullName: 'Estadio Banorte', address: { city: 'Mexico City', country: 'MX' } },
        competitors: [
          { homeAway: 'home', team: { displayName: 'Mexico' } },
          { homeAway: 'away', team: { displayName: 'South Africa' } },
        ],
      }],
    },
    {
      id: '2',
      date: '2026-07-19T19:00Z',
      name: 'TBD at TBD',
      season: { year: 2026, slug: 'final' },
      competitions: [{
        venue: { fullName: 'MetLife Stadium', address: { city: 'East Rutherford', country: 'US' } },
        competitors: [
          { homeAway: 'home', team: { displayName: 'TBD' } },
          { homeAway: 'away', team: { displayName: 'TBD' } },
        ],
      }],
    },
  ],
};

test('normalizeESPNData returns correct count', () => {
  const matches = normalizeESPNData(ESPN_MOCK);
  assert.equal(matches.length, 2);
});

test('normalizeESPNData maps group stage match correctly', () => {
  const matches = normalizeESPNData(ESPN_MOCK);
  const m = matches[0];
  assert.equal(m.matchNumber, 1);
  assert.equal(m.stage, 'Group Stage');
  assert.equal(m.group, null);
  assert.equal(m.homeTeam, 'Mexico');
  assert.equal(m.awayTeam, 'South Africa');
  assert.equal(m.venue, 'Estadio Banorte');
  assert.equal(m.city, 'Mexico City');
  assert.equal(m.kickoffUTC, '2026-06-11T19:00:00.000Z');
});

test('normalizeESPNData maps Final stage correctly', () => {
  const matches = normalizeESPNData(ESPN_MOCK);
  const m = matches[1];
  assert.equal(m.stage, 'Final');
  assert.equal(m.matchNumber, 2);
});

test('normalizeESPNData assigns sequential match numbers', () => {
  const matches = normalizeESPNData(ESPN_MOCK);
  assert.equal(matches[0].matchNumber, 1);
  assert.equal(matches[1].matchNumber, 2);
});
