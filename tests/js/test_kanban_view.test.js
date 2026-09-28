import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderKanbanHtml } from '../../src/static/js/ui/kanbanView.js';

describe('KanbanView - HTML Structure (AC-9, AC-10, AC-11, AC-20, AC-21, AC-28, AC-29)', () => {
  const dummyStages = [
    { id: 1, name: 'Idea', position: 1 },
    { id: 2, name: 'Guion', position: 2 },
  ];

  const dummyContentsByStage = {
    1: [
      {
        id: 101,
        title: 'New Idea for TikTok',
        publish_date: '2026-11-10',
        channel_name: 'TikTok',
        content_type_name: 'Vertical',
      },
    ],
    2: [],
  };

  test('AC-9 & AC-10: Renders columns and cards with title, channel, type, and date', () => {
    const html = renderKanbanHtml({
      stages: dummyStages,
      contentsByStage: dummyContentsByStage,
    });

    assert.match(html, /class="kanban-view-root/);
    assert.match(html, /class="kanban-column"/);
    assert.match(html, /data-stage-id="1"/);
    assert.match(html, /data-stage-id="2"/);
    assert.match(html, /Idea/);
    assert.match(html, /Guion/);
    assert.match(html, /New Idea for TikTok/);
    assert.match(html, /TikTok/);
    assert.match(html, /Vertical/);
    assert.match(html, /2026-11-10/);
    assert.match(html, /data-content-id="101"/);
  });
});
