import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { Repository } from '../../src/static/js/db/repository.js';
import { DEFAULT_CHANNEL_COLORS } from '../../src/static/js/db/schema.js';

describe('Repository - Database Migrations', () => {
  test('Adds missing color column to existing channels table and seeds brand colors', async () => {
    const rawDb = new DatabaseSync(':memory:');
    // Create old schema without color column
    rawDb.exec(`
      CREATE TABLE stages (id INTEGER PRIMARY KEY, name TEXT, position INTEGER);
      CREATE TABLE channels (id INTEGER PRIMARY KEY, name TEXT);
      CREATE TABLE content_types (id INTEGER PRIMARY KEY, name TEXT);
      CREATE TABLE contents (id INTEGER PRIMARY KEY, title TEXT, publish_date TEXT, stage_id INTEGER, channel_id INTEGER, content_type_id INTEGER, script TEXT);
      INSERT INTO channels (id, name) VALUES (1, 'YouTube'), (2, 'Instagram');
    `);

    const repo = new Repository();
    repo.db = rawDb;
    repo.isReady = true;

    // Check pre-condition: no color column
    const colsBefore = await repo.query('PRAGMA table_info(channels)');
    assert.equal(colsBefore.some((c) => c.name === 'color'), false);

    // Run migration
    await repo.runMigrations();

    // Check post-condition: color column added
    const colsAfter = await repo.query('PRAGMA table_info(channels)');
    assert.equal(colsAfter.some((c) => c.name === 'color'), true);

    // Check that existing channels got their brand colors
    const yt = await repo.queryOne('SELECT * FROM channels WHERE name = ?', ['YouTube']);
    assert.equal(yt.color, DEFAULT_CHANNEL_COLORS.YouTube);

    // Verify idempotency (calling runMigrations again does not throw or corrupt)
    await repo.runMigrations();
    const colsFinal = await repo.query('PRAGMA table_info(channels)');
    assert.equal(colsFinal.some((c) => c.name === 'color'), true);
  });
});
