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
