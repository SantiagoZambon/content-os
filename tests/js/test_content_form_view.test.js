import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderContentFormHtml } from '../../src/static/js/ui/contentFormView.js';

describe('ContentFormView - Form Rendering (AC-4, AC-5, AC-6, AC-7, AC-8, AC-28, AC-29)', () => {
  const dummyStages = [
    { id: 1, name: 'Idea', position: 1 },
    { id: 2, name: 'Guion', position: 2 },
  ];
  const dummyChannels = [
    { id: 1, name: 'YouTube' },
    { id: 2, name: 'Instagram' },
  ];
  const dummyTypes = [
    { id: 1, name: 'Video' },
    { id: 2, name: 'Vertical' },
  ];

  test('Renders creation form with all selectors, toolbar and live preview', () => {
    const html = renderContentFormHtml({
      content: null,
      stages: dummyStages,
      channels: dummyChannels,
      contentTypes: dummyTypes,
      isNew: true,
    });

    assert.match(html, /id="form-title"/);
    assert.match(html, /id="form-publish-date"/);
    assert.match(html, /id="form-channel"/);
    assert.match(html, /id="form-stage"/);
    assert.match(html, /id="form-content-type"/);
    assert.match(html, /id="form-script-textarea"/);
    assert.match(html, /id="form-script-preview"/);
    assert.match(html, /data-action="bold"/);
    assert.match(html, /data-action="h1"/);
    assert.match(html, /data-action="list"/);
    assert.match(html, /YouTube/);
    assert.match(html, /Instagram/);
  });

  test('Pre-populates values when in edit mode', () => {
    const existingContent = {
      id: 99,
      title: 'Editing Video',
      publish_date: '2026-11-20',
      channel_id: 1,
      stage_id: 2,
      content_type_id: 1,
      script: '# Script in edit',
    };

    const html = renderContentFormHtml({
      content: existingContent,
      stages: dummyStages,
      channels: dummyChannels,
      contentTypes: dummyTypes,
      isNew: false,
    });

    assert.match(html, /value="Editing Video"/);
    assert.match(html, /value="2026-11-20"/);
    assert.match(html, /# Script in edit/);
    assert.match(html, /Guardar cambios/);
  });
});
