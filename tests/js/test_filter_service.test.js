import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';
import { ContentService } from '../../src/static/js/services/contentService.js';
import { SettingsService } from '../../src/static/js/services/settingsService.js';
import { FilterService } from '../../src/static/js/services/filterService.js';

describe('FilterService - Cross Filtering (AC-20, AC-21)', () => {
  let repo;
  let contentService;
  let settingsService;
  let filterService;
  let stages;
  let channels;
  let types;

  beforeEach(async () => {
    repo = new Repository();
    await repo.initInMemory();
    contentService = new ContentService(repo);
    settingsService = new SettingsService(repo);
    filterService = new FilterService(contentService);

    stages = await settingsService.getStages();
    channels = await settingsService.getChannels();
    types = await settingsService.getContentTypes();

    const yt = channels.find((c) => c.name === 'YouTube').id;
    const ig = channels.find((c) => c.name === 'Instagram').id;
    const tk = channels.find((c) => c.name === 'TikTok').id;

    const stageIdea = stages.find((s) => s.name === 'Idea').id;
    const stageGuion = stages.find((s) => s.name === 'Guion').id;

    const typeVideo = types.find((t) => t.name === 'Video').id;
    const typeVertical = types.find((t) => t.name === 'Vertical').id;

    await contentService.createContent({
      title: 'YouTube Video in Idea',
      publish_date: '2026-10-05',
      channel_id: yt,
      stage_id: stageIdea,
      content_type_id: typeVideo,
    });

    await contentService.createContent({
      title: 'Instagram Vertical in Guion',
      publish_date: '2026-10-15',
      channel_id: ig,
      stage_id: stageGuion,
      content_type_id: typeVertical,
    });

    await contentService.createContent({
      title: 'TikTok Vertical in Idea',
      publish_date: '2026-10-25',
      channel_id: tk,
      stage_id: stageIdea,
      content_type_id: typeVertical,
    });
  });

  test('AC-20: Filters by channel_id', async () => {
    const ytId = channels.find((c) => c.name === 'YouTube').id;
    filterService.setFilter('channel_id', ytId);
    const results = await filterService.getFilteredContents();

    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'YouTube Video in Idea');
  });

  test('AC-20: Filters by stage_id', async () => {
    const stageGuion = stages.find((s) => s.name === 'Guion').id;
    filterService.setFilter('stage_id', stageGuion);
    const results = await filterService.getFilteredContents();

    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Instagram Vertical in Guion');
  });

  test('AC-20: Filters by date range', async () => {
    filterService.setFilter('start_date', '2026-10-10');
    filterService.setFilter('end_date', '2026-10-20');
    const results = await filterService.getFilteredContents();

    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'Instagram Vertical in Guion');
  });

  test('AC-20: Combines multiple filters (channel and type)', async () => {
    const tkId = channels.find((c) => c.name === 'TikTok').id;
    const typeVertical = types.find((t) => t.name === 'Vertical').id;

    filterService.setFilter('channel_id', tkId);
    filterService.setFilter('content_type_id', typeVertical);
    const results = await filterService.getFilteredContents();

    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'TikTok Vertical in Idea');
  });

  test('AC-21: Resetting filters returns all contents', async () => {
    const ytId = channels.find((c) => c.name === 'YouTube').id;
    filterService.setFilter('channel_id', ytId);
    let results = await filterService.getFilteredContents();
    assert.equal(results.length, 1);

    filterService.resetFilters();
    results = await filterService.getFilteredContents();
    assert.equal(results.length, 3);
  });
});
