import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { renderSettingsHtml } from '../../src/static/js/ui/settingsView.js';

describe('SettingsView - Markup & Structure (AC-22, AC-25, AC-26, AC-27, AC-28, AC-29)', () => {
  const dummyStages = [
    { id: 1, name: 'Idea', position: 1 },
    { id: 2, name: 'Publicado', position: 2 },
  ];
  const dummyChannels = [{ id: 1, name: 'YouTube' }];
  const dummyTypes = [{ id: 1, name: 'Video' }];

  test('Renders settings cards and backup actions', () => {
    const html = renderSettingsHtml({
      stages: dummyStages,
      channels: dummyChannels,
      contentTypes: dummyTypes,
    });

    assert.match(html, /class="settings-view-root/);
    assert.match(html, /Etapas del Tablero/);
    assert.match(html, /Redes Sociales/);
    assert.match(html, /Tipos de Contenido/);
    assert.match(html, /Copias de Seguridad/);
    assert.match(html, /id="btn-export-backup"/);
    assert.match(html, /id="btn-import-backup"/);
    assert.match(html, /id="form-add-stage"/);
    assert.match(html, /id="form-add-channel"/);
    assert.match(html, /id="form-add-type"/);
    assert.match(html, /data-delete-stage="1"/);
  });
});
