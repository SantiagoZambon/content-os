import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';
import { SettingsService } from '../../src/static/js/services/settingsService.js';

describe('SettingsService - Reassignment Rules (AC-23, AC-24)', () => {
  let repo;
  let service;

  beforeEach(async () => {
    repo = new Repository();
    await repo.initInMemory();
    service = new SettingsService(repo);
  });

  test('AC-23: Reassigns contents to first available stage when their current stage is deleted', async () => {
    const stages = await service.getStages();
    const stageIdea = stages.find((s) => s.name === 'Idea');
    const stageGuion = stages.find((s) => s.name === 'Guion');

    // Insert content in 'Guion'
    const res = await repo.exec(
      'INSERT INTO contents (title, publish_date, stage_id) VALUES (?, ?, ?)',
      ['Scripted Content', '2026-10-15', stageGuion.id]
    );
    const contentId = res.lastInsertRowId;

    // Delete 'Guion' stage
    await service.deleteStage(stageGuion.id);

    // Verify content still exists and its stage_id was reassigned to 'Idea'
    const updatedContent = await repo.queryOne('SELECT * FROM contents WHERE id = ?', [contentId]);
    assert.ok(updatedContent);
    assert.equal(updatedContent.stage_id, stageIdea.id);
  });

  test('AC-24: Sets channel_id to NULL when channel is deleted without deleting the content', async () => {
    const stages = await service.getStages();
    const channels = await service.getChannels();
    const yt = channels.find((c) => c.name === 'YouTube');

    // Insert content assigned to YouTube
    const res = await repo.exec(
      'INSERT INTO contents (title, publish_date, stage_id, channel_id) VALUES (?, ?, ?, ?)',
      ['YT Video', '2026-10-20', stages[0].id, yt.id]
    );
    const contentId = res.lastInsertRowId;

    // Delete YouTube channel
    await service.deleteChannel(yt.id);

    // Content still exists, channel_id is null
    const content = await repo.queryOne('SELECT * FROM contents WHERE id = ?', [contentId]);
    assert.ok(content);
    assert.equal(content.channel_id, null);
  });

  test('AC-24: Sets content_type_id to NULL when content type is deleted without deleting the content', async () => {
    const stages = await service.getStages();
    const types = await service.getContentTypes();
    const videoType = types.find((t) => t.name === 'Video');

    // Insert content assigned to Video type
    const res = await repo.exec(
      'INSERT INTO contents (title, publish_date, stage_id, content_type_id) VALUES (?, ?, ?, ?)',
      ['Video Post', '2026-10-22', stages[0].id, videoType.id]
    );
    const contentId = res.lastInsertRowId;

    // Delete Video type
    await service.deleteContentType(videoType.id);

    // Content still exists, content_type_id is null
    const content = await repo.queryOne('SELECT * FROM contents WHERE id = ?', [contentId]);
    assert.ok(content);
    assert.equal(content.content_type_id, null);
  });
});
