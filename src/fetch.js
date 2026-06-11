const { DateTime } = require('luxon');

const FEED_URL = 'https://raw.githubusercontent.com/openfootball/world-cup.json/master/2026/en/rounds.json';

const VENUE_TIMEZONES = {
  'metlife': 'America/New_York',
  'lincoln-financial': 'America/New_York',
  'hard-rock': 'America/New_York',
  'gillette': 'America/New_York',
  'att-stadium': 'America/Chicago',
  'arrowhead': 'America/Chicago',
  'rose-bowl': 'America/Los_Angeles',
  'levis-stadium': 'America/Los_Angeles',
  'sofi-stadium': 'America/Los_Angeles',
  'lumen-field': 'America/Los_Angeles',
  'allegiant': 'America/Los_Angeles',
  'bmo-field': 'America/Toronto',
  'bc-place': 'America/Vancouver',
  'azteca': 'America/Mexico_City',
  'bbva': 'America/Mexico_City',
  'akron': 'America/Mexico_City',
};

function stageFromRoundName(roundName) {
  const n = roundName.toLowerCase();
  if (n.includes('matchday') || n.includes('group')) return 'Group Stage';
  if (n.includes('32')) return 'Round of 32';
  if (n.includes('16')) return 'Round of 16';
  if (n.includes('quarter')) return 'Quarterfinals';
  if (n.includes('semi')) return 'Semifinals';
  if (n.includes('final')) return 'Final';
  return roundName;
}

function venueLocalToUTC(dateStr, timeStr, venueKey) {
  const timezone = VENUE_TIMEZONES[venueKey] || 'UTC';
  const dt = DateTime.fromISO(`${dateStr}T${timeStr}:00`, { zone: timezone });
  return dt.toUTC().toISO();
}

function normalizeMatches(rawData) {
  const matches = [];
  for (const round of rawData.rounds || []) {
    const stage = stageFromRoundName(round.name);
    for (const m of round.matches || []) {
      const venueKey = m.stadium?.key || '';
      const groupRaw = m.group || null;
      const group = groupRaw ? groupRaw.replace(/^Group\s+/i, '') : null;

      let kickoffUTC;
      try {
        kickoffUTC = venueLocalToUTC(m.date, m.time || '00:00', venueKey);
      } catch (e) {
        console.warn(`Warning: could not parse time for match ${m.num}, using raw date`);
        kickoffUTC = `${m.date}T00:00:00.000Z`;
      }

      matches.push({
        matchNumber: m.num,
        stage,
        group,
        homeTeam: m.team1?.name || 'TBD',
        awayTeam: m.team2?.name || 'TBD',
        kickoffUTC,
        venue: m.stadium?.name || 'TBD',
        city: m.city || 'TBD',
        country: m.country || 'TBD',
      });
    }
  }
  return matches;
}

async function fetchAndNormalize() {
  let response;
  try {
    response = await fetch(FEED_URL);
  } catch (e) {
    throw new Error(`Network error fetching schedule: ${e.message}\nPopulate data/schedule.json manually.`);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch schedule (HTTP ${response.status}): ${FEED_URL}\nPopulate data/schedule.json manually.`
    );
  }

  const rawData = await response.json();
  const matches = normalizeMatches(rawData);

  if (matches.length === 0) {
    throw new Error('Fetched data contained no matches. Check the feed URL or populate data/schedule.json manually.');
  }

  return matches;
}

module.exports = { normalizeMatches, fetchAndNormalize };
