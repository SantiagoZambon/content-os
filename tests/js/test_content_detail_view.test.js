import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderContentDetailHtml } from '../../src/static/js/ui/contentDetailView.js';

describe('ContentDetailView - Read-Only View (AC-15, AC-16, AC-17, AC-18, AC-28, AC-29)', () => {
  const dummyContent = {
    id: 77,
    title: 'Comprehensive Guide to OPFS',
    publish_date: '2026-12-05',
    stage_name: 'Grabacion',
    channel_name: 'YouTube',
    content_type_name: 'Video',
    script: '# Introduction\nToday we talk about **OPFS**.\n- Fast\n- Private',
  };

  test('Renders read-only content details with signature element and rendered markdown', () => {
    const html = renderContentDetailHtml(dummyContent);

    assert.match(html, /Comprehensive Guide to OPFS/);
    assert.match(html, /YouTube/);
    assert.match(html, /Grabacion/);
    assert.match(html, /2026-12-05/);
    assert.match(html, /href="#\/content\/edit\/77"/);
    assert.match(html, /id="btn-delete-content"/);
    assert.match(html, /signature-halo-ring/);
    assert.match(html, /<h1>Introduction<\/h1>/);
    assert.match(html, /<strong>OPFS<\/strong>/);
    assert.match(html, /<li>Fast<\/li>/);
  });
});
