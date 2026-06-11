const { slugify } = require('./ical.js');

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHTML(teams) {
  const teamItems = teams
    .map(team => {
      const slug = slugify(team);
      return `    <li class="team-item" data-name="${escapeHTML(team.toLowerCase())}">
      <a href="output/${slug}.ics" download>${escapeHTML(team)}</a>
    </li>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2026 FIFA World Cup Calendar</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; max-width: 580px; margin: 48px auto; padding: 0 20px; color: #1a1a1a; }
    h1 { font-size: 1.4rem; margin-bottom: 4px; }
    p.sub { color: #555; margin: 0 0 20px; font-size: 0.9rem; }
    .btn-all { display: block; background: #1a5e36; color: #fff; padding: 13px 20px; border-radius: 8px; text-decoration: none; text-align: center; font-size: 1rem; font-weight: 600; margin-bottom: 24px; }
    .btn-all:hover { background: #154d2c; }
    input { width: 100%; padding: 9px 12px; font-size: 0.95rem; border: 1px solid #ccc; border-radius: 6px; margin-bottom: 12px; outline-offset: 2px; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { border-bottom: 1px solid #eee; }
    li a { display: block; padding: 9px 4px; color: #1a5e36; text-decoration: none; font-size: 0.95rem; }
    li a:hover { text-decoration: underline; }
    li.hidden { display: none; }
  </style>
</head>
<body>
  <h1>2026 FIFA World Cup Calendar</h1>
  <p class="sub">Import into Google Calendar, Apple Calendar, or Outlook. Times adjust to your timezone automatically.</p>
  <a class="btn-all" href="output/all.ics" download>Download All 104 Matches (.ics)</a>
  <input type="search" id="filter" placeholder="Filter by country..." oninput="filterTeams(this.value)" aria-label="Filter countries">
  <ul id="teams">
${teamItems}
  </ul>
  <script>
    function filterTeams(q) {
      const query = q.toLowerCase();
      document.querySelectorAll('.team-item').forEach(li => {
        li.classList.toggle('hidden', !li.dataset.name.includes(query));
      });
    }
  </script>
</body>
</html>`;
}

module.exports = { buildHTML };
