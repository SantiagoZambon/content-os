import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SCHEMA_SQL, DEFAULT_SEEDS } from '../../src/static/js/db/schema.js';
import { Repository } from '../../src/static/js/db/repository.js';

describe('Database Schema & Repository', () => {
  test('SCHEMA_SQL contains all 4 required tables', () => {
    assert.match(SCHEMA_SQL, /CREATE TABLE IF NOT EXISTS stages/);
    assert.match(SCHEMA_SQL, /CREATE TABLE IF NOT EXISTS channels/);
    assert.match(SCHEMA_SQL, /CREATE TABLE IF NOT EXISTS content_types/);
    assert.match(SCHEMA_SQL, /CREATE TABLE IF NOT EXISTS contents/);
  });

  test('DEFAULT_SEEDS defines 5 stages, 5 channels and 4 content types', () => {
    assert.equal(DEFAULT_SEEDS.stages.length, 5);
    assert.deepEqual(DEFAULT_SEEDS.stages, ['Idea', 'Guion', 'Grabacion', 'Edicion', 'Publicado']);
    assert.equal(DEFAULT_SEEDS.channels.length, 5);
    assert.deepEqual(DEFAULT_SEEDS.channels, ['YouTube', 'Instagram', 'TikTok', 'Linkedin', 'X']);
    assert.equal(DEFAULT_SEEDS.content_types.length, 4);
    assert.deepEqual(DEFAULT_SEEDS.content_types, ['Video', 'Publicacion', 'Vertical', 'Articulo']);
  });

  test('Repository initializes schema and runs CRUD operations in memory', async () => {
    const repo = new Repository();
    await repo.initInMemory();

    // Verify stages are seeded
    const stages = await repo.query('SELECT * FROM stages ORDER BY position ASC');
    assert.equal(stages.length, 5);
    assert.equal(stages[0].name, 'Idea');

    // Insert a test content
    const result = await repo.exec(
      'INSERT INTO contents (title, publish_date, stage_id, script) VALUES (?, ?, ?, ?)',
      ['Test Title', '2026-10-01', stages[0].id, '# Test Script']
    );
    assert.ok(result.lastInsertRowId > 0);

    const contents = await repo.query('SELECT * FROM contents WHERE id = ?', [result.lastInsertRowId]);
    assert.equal(contents.length, 1);
    assert.equal(contents[0].title, 'Test Title');
  });
});
