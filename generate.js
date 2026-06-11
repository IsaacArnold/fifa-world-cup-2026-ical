const fs = require('fs');
const path = require('path');
const { fetchAndNormalize } = require('./src/fetch');
const { buildCalendar, slugify } = require('./src/ical');
const { buildHTML } = require('./src/html');

const DATA_PATH = path.join(__dirname, 'data', 'schedule.json');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function main() {
  const refresh = process.argv.includes('--refresh');

  // --- Fetch phase ---
  if (refresh || !fs.existsSync(DATA_PATH)) {
    console.log('Fetching schedule from openfootball...');
    const matches = await fetchAndNormalize();
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
    fs.writeFileSync(DATA_PATH, JSON.stringify(matches, null, 2));
    console.log(`Saved ${matches.length} matches to data/schedule.json`);
  } else {
    console.log('Using cached data/schedule.json (pass --refresh to re-fetch)');
  }

  // --- Generate phase ---
  const matches = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Full calendar
  fs.writeFileSync(path.join(OUTPUT_DIR, 'all.ics'), buildCalendar(matches));
  console.log(`Generated output/all.ics (${matches.length} matches)`);

  // Per-nation calendars
  const teams = [
    ...new Set(
      matches
        .flatMap(m => [m.homeTeam, m.awayTeam])
        .filter(t => t !== 'TBD')
    ),
  ].sort();

  for (const team of teams) {
    const teamMatches = matches.filter(
      m => m.homeTeam === team || m.awayTeam === team
    );
    const slug = slugify(team);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.ics`), buildCalendar(teamMatches));
  }
  console.log(`Generated ${teams.length} team calendars in output/`);

  // index.html
  fs.writeFileSync(path.join(__dirname, 'index.html'), buildHTML(teams));
  console.log('Generated index.html');
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
