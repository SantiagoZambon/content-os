import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Repository } from '../../src/static/js/db/repository.js';

describe('Repository - Dual Mode: Local (OPFS/Memory) vs Server Mode (AC-6, AC-7)', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('AC-7: Operates in local mode when not authenticated', async () => {
    globalThis.fetch = async (url) => {
      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({ authenticated: false, user: null }),
        };
      }
      throw new Error(`Unexpected fetch call to ${url}`);
    };

    const repo = new Repository();
    await repo.init();

    assert.equal(repo.mode, 'local');
    assert.equal(repo.isServerMode(), false);

    // Queries run on local database
    const stages = await repo.query('SELECT * FROM stages ORDER BY position ASC');
    assert.equal(stages.length, 5);
    assert.equal(stages[0].name, 'Idea');
  });

  test('AC-6: Operates in server mode when authenticated, routing queries to /api/server/*', async () => {
    const recordedCalls = [];

    globalThis.fetch = async (url, options = {}) => {
      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({ authenticated: true, user: 'admin' }),
        };
      }

      recordedCalls.push({ url, options });

      if (url === '/api/server/query') {
        const body = JSON.parse(options.body);
        if (body.sql.includes('COUNT(*)')) {
          return {
            ok: true,
            json: async () => ({ rows: [{ count: 5 }] }),
          };
        }
        return {
          ok: true,
          json: async () => ({
            rows: [{ id: 1, title: 'Server Item', publish_date: '2026-10-20' }],
          }),
        };
      }

      if (url === '/api/server/exec') {
        return {
          ok: true,
          json: async () => ({ lastInsertRowId: 10, changes: 1 }),
        };
      }

      if (url === '/api/server/backup/export') {
        return {
          ok: true,
          json: async () => ({ version: 1, contents: [] }),
        };
      }

      if (url === '/api/server/backup/import') {
        return {
          ok: true,
          json: async () => ({ success: true }),
        };
      }

      throw new Error(`Unexpected fetch call to ${url}`);
    };

    const repo = new Repository();
    await repo.init();

    assert.equal(repo.mode, 'server');
    assert.equal(repo.isServerMode(), true);
    assert.equal(repo.currentUser, 'admin');

    // Test query calls /api/server/query
    const rows = await repo.query('SELECT * FROM contents WHERE id = ?', [1]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].title, 'Server Item');

    // Test exec calls /api/server/exec
    const execRes = await repo.exec('INSERT INTO contents (title) VALUES (?)', ['New Title']);
    assert.equal(execRes.lastInsertRowId, 10);
    assert.equal(execRes.changes, 1);

    // Test backup export and import
    const exported = await repo.exportData();
    assert.equal(exported.version, 1);

    const imported = await repo.importData({ version: 1, stages: [], contents: [] });
    assert.equal(imported, true);

    // Verify API calls were made
    assert.ok(recordedCalls.some((c) => c.url === '/api/server/query'));
    assert.ok(recordedCalls.some((c) => c.url === '/api/server/exec'));
  });

  test('Throws descriptive error when server session expires (401)', async () => {
    globalThis.fetch = async (url) => {
      if (url === '/api/auth/status') {
        return {
          ok: true,
          json: async () => ({ authenticated: true, user: 'admin' }),
        };
      }
      if (url === '/api/server/query') {
        return {
          status: 401,
          ok: false,
          json: async () => ({ error: 'No autorizado' }),
        };
      }
      throw new Error(`Unexpected fetch call to ${url}`);
    };

    const repo = new Repository();
    await repo.init();

    await assert.rejects(
      async () => await repo.query('SELECT * FROM contents'),
      /Sesión expirada o no autorizada/
    );
  });
});
