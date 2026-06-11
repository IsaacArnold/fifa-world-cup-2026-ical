const TEAM_FLAGS = {
  'Algeria': '🇩🇿',
  'Argentina': '🇦🇷',
  'Australia': '🇦🇺',
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Bosnia-Herzegovina': '🇧🇦',
  'Brazil': '🇧🇷',
  'Canada': '🇨🇦',
  'Cape Verde': '🇨🇻',
  'Colombia': '🇨🇴',
  'Congo DR': '🇨🇩',
  'Croatia': '🇭🇷',
  'Curaçao': '🇨🇼',
  'Czechia': '🇨🇿',
  'Ecuador': '🇪🇨',
  'Egypt': '🇪🇬',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Ghana': '🇬🇭',
  'Haiti': '🇭🇹',
  'Iran': '🇮🇷',
  'Iraq': '🇮🇶',
  'Ivory Coast': '🇨🇮',
  'Japan': '🇯🇵',
  'Jordan': '🇯🇴',
  'Mexico': '🇲🇽',
  'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱',
  'New Zealand': '🇳🇿',
  'Norway': '🇳🇴',
  'Panama': '🇵🇦',
  'Paraguay': '🇵🇾',
  'Portugal': '🇵🇹',
  'Qatar': '🇶🇦',
  'Saudi Arabia': '🇸🇦',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal': '🇸🇳',
  'South Africa': '🇿🇦',
  'South Korea': '🇰🇷',
  'Spain': '🇪🇸',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'Tunisia': '🇹🇳',
  'Türkiye': '🇹🇷',
  'United States': '🇺🇸',
  'Uruguay': '🇺🇾',
  'Uzbekistan': '🇺🇿',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function formatUTCDate(isoString) {
  return isoString
    .replace(/\.\d+Z$/, 'Z')
    .replace(/[-:]/g, '');
}

function teamWithFlag(name) {
  const flag = TEAM_FLAGS[name];
  return flag ? `${flag} ${name}` : name;
}

function matchToVEvent(match) {
  const start = formatUTCDate(match.kickoffUTC);
  const endDate = new Date(match.kickoffUTC);
  endDate.setHours(endDate.getHours() + 2);
  const end = formatUTCDate(endDate.toISOString());

  const matchNumStr = String(match.matchNumber).padStart(3, '0');
  const uid = `fifa2026-match-${matchNumStr}@fifa-world-cup-2026`;
  const prefix = match.group ? `Group ${match.group}` : match.stage;
  const summary = `${prefix}: ${teamWithFlag(match.homeTeam)} vs ${teamWithFlag(match.awayTeam)} — ${match.city}`;

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    'END:VEVENT',
  ].join('\r\n');
}

function buildCalendar(matches) {
  const events = matches.map(matchToVEvent).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FIFA World Cup 2026//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FIFA World Cup 2026',
    'X-WR-TIMEZONE:UTC',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

module.exports = { slugify, formatUTCDate, matchToVEvent, buildCalendar };
