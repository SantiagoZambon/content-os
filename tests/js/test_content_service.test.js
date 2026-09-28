import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';
import { ContentService } from '../../src/static/js/services/contentService.js';
import { SettingsService } from '../../src/static/js/services/settingsService.js';

describe('ContentService - Content CRUD & Validations (AC-4, AC-5, AC-6, AC-8)', () => {
  let repo;
  let contentService;
  let settingsService;

  beforeEach(async () => {
    repo = new Repository();
    await repo.initInMemory();
    contentService = new ContentService(repo);
    settingsService = new SettingsService(repo);
  });

  test('AC-4: Successfully creates content with mandatory fields', async () => {
    const channels = await settingsService.getChannels();
    const yt = channels.find((c) => c.name === 'YouTube');

    const created = await contentService.createContent({
      title: 'How to use SQLite WASM',
      publish_date: '2026-10-05',
      channel_id: yt.id,
      script: '# Intro\nWelcome everyone.',
    });

    assert.ok(created.id > 0);
    assert.equal(created.title, 'How to use SQLite WASM');
    assert.equal(created.publish_date, '2026-10-05');
    assert.equal(created.channel_id, yt.id);
    assert.equal(created.script, '# Intro\nWelcome everyone.');
  });

  test('AC-5: Rejects creation when mandatory fields are missing or whitespace-only', async () => {
    const channels = await settingsService.getChannels();
    const channelId = channels[0].id;

    // Missing title
    await assert.rejects(
      async () =>
        await contentService.createContent({
          title: '   ',
          publish_date: '2026-10-05',
          channel_id: channelId,
        }),
      /El título es obligatorio/
    );

    // Missing publish_date
    await assert.rejects(
      async () =>
        await contentService.createContent({
          title: 'My Video',
          publish_date: '',
          channel_id: channelId,
        }),
      /La fecha de publicación es obligatoria/
    );

    // Missing channel_id
    await assert.rejects(
      async () =>
        await contentService.createContent({
          title: 'My Video',
          publish_date: '2026-10-05',
          channel_id: null,
        }),
      /La red social es obligatoria/
    );
  });

  test('AC-6: Automatically assigns "Idea" stage when stage_id is omitted', async () => {
    const channels = await settingsService.getChannels();
    const stages = await settingsService.getStages();
    const ideaStage = stages.find((s) => s.name === 'Idea');

    const created = await contentService.createContent({
      title: 'New Idea Content',
      publish_date: '2026-10-08',
      channel_id: channels[0].id,
      // stage_id omitted
    });

    assert.equal(created.stage_id, ideaStage.id);
  });

  test('AC-8: Updates existing content correctly', async () => {
    const channels = await settingsService.getChannels();
    const stages = await settingsService.getStages();

    const created = await contentService.createContent({
      title: 'Original Title',
      publish_date: '2026-10-10',
      channel_id: channels[0].id,
    });

    const guionStage = stages.find((s) => s.name === 'Guion');
    const updated = await contentService.updateContent(created.id, {
      title: 'Updated Title',
      publish_date: '2026-10-12',
      stage_id: guionStage.id,
      channel_id: channels[1].id,
      script: 'Updated Script Content',
    });

    assert.equal(updated.id, created.id);
    assert.equal(updated.title, 'Updated Title');
    assert.equal(updated.publish_date, '2026-10-12');
    assert.equal(updated.stage_id, guionStage.id);
    assert.equal(updated.channel_id, channels[1].id);
    assert.equal(updated.script, 'Updated Script Content');
  });

  test('Deletes content and returns true', async () => {
    const channels = await settingsService.getChannels();
    const created = await contentService.createContent({
      title: 'To be deleted',
      publish_date: '2026-10-15',
      channel_id: channels[0].id,
    });

    const deleted = await contentService.deleteContent(created.id);
    assert.equal(deleted, true);

    const fetched = await contentService.getContentById(created.id);
    assert.equal(fetched, null);
  });
});
