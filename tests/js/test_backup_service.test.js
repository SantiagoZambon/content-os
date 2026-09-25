import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';
import { ContentService } from '../../src/static/js/services/contentService.js';
import { SettingsService } from '../../src/static/js/services/settingsService.js';
import { BackupService } from '../../src/static/js/services/backupService.js';

describe('BackupService - Export & Import (AC-26, AC-27)', () => {
  let repo;
  let contentService;
  let settingsService;
  let backupService;

  beforeEach(async () => {
    repo = new Repository();
    await repo.initInMemory();
    contentService = new ContentService(repo);
    settingsService = new SettingsService(repo);
    backupService = new BackupService(repo);
  });

  test('AC-26: Exports complete database snapshot as JSON string', async () => {
    const channels = await settingsService.getChannels();
    const stages = await settingsService.getStages();

    await contentService.createContent({
      title: 'Exportable Content',
      publish_date: '2026-11-01',
      channel_id: channels[0].id,
      stage_id: stages[0].id,
      script: 'Script to export',
    });

    const jsonStr = await backupService.exportBackup();
    assert.equal(typeof jsonStr, 'string');

    const parsed = JSON.parse(jsonStr);
    assert.equal(parsed.version, 1);
    assert.ok(Array.isArray(parsed.stages));
    assert.ok(Array.isArray(parsed.channels));
    assert.ok(Array.isArray(parsed.contentTypes));
    assert.ok(Array.isArray(parsed.contents));
    assert.equal(parsed.contents.length, 1);
    assert.equal(parsed.contents[0].title, 'Exportable Content');
  });

  test('AC-27: Imports valid backup and restores all tables', async () => {
    const backupData = {
      version: 1,
      exportedAt: '2026-09-23T12:00:00.000Z',
      stages: [
        { id: 1, name: 'Backlog', position: 1 },
        { id: 2, name: 'Done', position: 2 },
      ],
      channels: [{ id: 1, name: 'Custom Channel' }],
      contentTypes: [{ id: 1, name: 'Thread' }],
      contents: [
        {
          id: 10,
          title: 'Restored Content',
          publish_date: '2026-12-01',
          stage_id: 1,
          channel_id: 1,
          content_type_id: 1,
          script: 'Restored script',
        },
      ],
    };

    const success = await backupService.importBackup(JSON.stringify(backupData));
    assert.equal(success, true);

    const stages = await settingsService.getStages();
    assert.equal(stages.length, 2);
    assert.equal(stages[0].name, 'Backlog');

    const contents = await contentService.getAllContents();
    assert.equal(contents.length, 1);
    assert.equal(contents[0].title, 'Restored Content');
  });

  test('Rejects corrupted or invalid JSON without modifying existing data', async () => {
    const stagesBefore = await settingsService.getStages();
    const contentsBefore = await contentService.getAllContents();

    // Invalid JSON string
    await assert.rejects(
      async () => await backupService.importBackup('{ not valid json'),
      /El archivo de copia de seguridad no tiene un formato JSON válido/
    );

    // Missing required fields
    await assert.rejects(
      async () => await backupService.importBackup(JSON.stringify({ version: 1 })),
      /El archivo de copia de seguridad no contiene la estructura requerida/
    );

    // Data should remain intact
    const stagesAfter = await settingsService.getStages();
    const contentsAfter = await contentService.getAllContents();

    assert.equal(stagesAfter.length, stagesBefore.length);
    assert.equal(contentsAfter.length, contentsBefore.length);
  });
});
