const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildHTML } = require('../src/html.js');

test('buildHTML includes Download All button linking to output/all.ics', () => {
  const html = buildHTML(['Mexico', 'Argentina']);
  assert.ok(html.includes('href="output/all.ics"'));
  assert.ok(html.includes('download'));
});

test('buildHTML includes a link for each team', () => {
  const html = buildHTML(['Mexico', 'United States', 'Brazil']);
  assert.ok(html.includes('href="output/mexico.ics"'));
  assert.ok(html.includes('href="output/united-states.ics"'));
  assert.ok(html.includes('href="output/brazil.ics"'));
});

test('buildHTML includes filter input', () => {
  const html = buildHTML(['Mexico']);
  assert.ok(html.includes('<input'));
  assert.ok(html.includes('filterTeams'));
});

test('buildHTML uses data-name attribute for filtering', () => {
  const html = buildHTML(['United States']);
  assert.ok(html.includes('data-name="united states"'));
});

test('buildHTML is valid HTML with head and body', () => {
  const html = buildHTML(['Mexico']);
  assert.ok(html.includes('<!DOCTYPE html>'));
  assert.ok(html.includes('<html'));
  assert.ok(html.includes('</html>'));
  assert.ok(html.includes('<head>'));
  assert.ok(html.includes('<body>'));
});
