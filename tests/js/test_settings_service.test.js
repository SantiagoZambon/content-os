import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';
import { SettingsService } from '../../src/static/js/services/settingsService.js';

describe('SettingsService - Defaults & Configurations (AC-1, AC-2, AC-3, AC-22, AC-25)', () => {
  let repo;
  let service;

  beforeEach(async () => {
    repo = new Repository();
    await repo.initInMemory();
    service = new SettingsService(repo);
  });

  test('AC-1: Retrieves the 5 default stages in positional order', async () => {
    const stages = await service.getStages();
    assert.equal(stages.length, 5);
    assert.deepEqual(
      stages.map((s) => s.name),
      ['Idea', 'Guion', 'Grabacion', 'Edicion', 'Publicado']
    );
  });

  test('AC-2: Retrieves the 5 default channels', async () => {
    const channels = await service.getChannels();
    assert.equal(channels.length, 5);
    assert.deepEqual(
      channels.map((c) => c.name),
      ['YouTube', 'Instagram', 'TikTok', 'Linkedin', 'X']
    );
  });

  test('AC-3: Retrieves the 4 default content types', async () => {
    const types = await service.getContentTypes();
    assert.equal(types.length, 4);
    assert.deepEqual(
      types.map((t) => t.name),
      ['Video', 'Publicacion', 'Vertical', 'Articulo']
    );
  });

  test('AC-22: Can create and update stages, channels, and types', async () => {
    const newStage = await service.createStage('Review');
    assert.equal(newStage.name, 'Review');
    assert.equal(newStage.position, 6);

    const updated = await service.updateStage(newStage.id, 'Under Review');
    assert.equal(updated.name, 'Under Review');

    const newChannel = await service.createChannel('Threads');
    assert.equal(newChannel.name, 'Threads');

    const newType = await service.createContentType('Podcast');
    assert.equal(newType.name, 'Podcast');
  });

  test('Rejects duplicate names', async () => {
    await assert.rejects(
      async () => await service.createStage('Idea'),
      /Ya existe una etapa con el nombre "Idea"/
    );
    await assert.rejects(
      async () => await service.createChannel('YouTube'),
      /Ya existe una red social con el nombre "YouTube"/
    );
    await assert.rejects(
      async () => await service.createContentType('Video'),
      /Ya existe un tipo de contenido con el nombre "Video"/
    );
  });

  test('AC-25: Rejects deleting the last remaining stage', async () => {
    const stages = await service.getStages();
    // Delete 4 stages
    for (let i = 1; i < stages.length; i++) {
      await service.deleteStage(stages[i].id);
    }

    const remaining = await service.getStages();
    assert.equal(remaining.length, 1);

    await assert.rejects(
      async () => await service.deleteStage(remaining[0].id),
      /Debe existir al menos una etapa activa/
    );
  });
});
