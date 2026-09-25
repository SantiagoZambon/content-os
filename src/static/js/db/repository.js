import { SCHEMA_SQL, DEFAULT_SEEDS } from './schema.js';

export class Repository {
  constructor() {
    this.db = null;
    this.promiser = null;
    this.dbId = null;
    this.isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;
    this.isReady = false;
  }

  async init(options = {}) {
    if (this.isReady && (this.db || this.promiser)) {
      return this;
    }

    if (this.isNode) {
      await this.initInMemory();
      return this;
    }

    // In-browser SQLite WASM with OPFS via Web Worker
    try {
      if (typeof window !== 'undefined' && window.sqlite3Worker1Promiser) {
        const promiser = await window.sqlite3Worker1Promiser.v2({
          worker: () => new Worker('/static/vendor/sqlite3-worker1.js'),
        });
        this.promiser = promiser;

        let openRes;
        try {
          openRes = await promiser('open', {
            filename: 'content_os.sqlite3',
            vfs: 'opfs',
          });
          console.log('Opened SQLite with persistent OPFS storage:', openRes);
        } catch (opfsErr) {
          console.warn('OPFS open failed, falling back to standard VFS:', opfsErr);
          openRes = await promiser('open', {
            filename: 'content_os.sqlite3',
          });
        }

        this.dbId = openRes.dbId;
        await this.promiser('exec', { dbId: this.dbId, sql: SCHEMA_SQL });
        await this.seedDefaults();
        this.isReady = true;
        return this;
      }

      // Fallback if Promiser is not available on window
      const sqlite3InitModule = window.sqlite3InitModule;
      if (!sqlite3InitModule) {
        throw new Error('Neither sqlite3Worker1Promiser nor sqlite3InitModule found on window');
      }

      const sqlite3 = await sqlite3InitModule({
        print: console.log,
        printErr: console.error,
      });

      this.db = new sqlite3.oo1.DB('/content_os.sqlite3', 'c');
      this.db.exec(SCHEMA_SQL);
      await this.seedDefaults();
      this.isReady = true;
      return this;
    } catch (err) {
      console.error('Failed to initialize SQLite WASM:', err);
      throw err;
    }
  }

  async initInMemory() {
    if (this.isNode) {
      const { DatabaseSync } = await import('node:sqlite');
      this.db = new DatabaseSync(':memory:');
      this.db.exec(SCHEMA_SQL);
      await this.seedDefaults();
      this.isReady = true;
      return this;
    }

    if (window.sqlite3InitModule) {
      const sqlite3 = await window.sqlite3InitModule();
      this.db = new sqlite3.oo1.DB(':memory:', 'c');
      this.db.exec(SCHEMA_SQL);
      await this.seedDefaults();
      this.isReady = true;
      return this;
    }

    throw new Error('Unable to initialize in-memory database');
  }

  async seedDefaults() {
    // Check if stages is empty
    const stages = await this.query('SELECT COUNT(*) as count FROM stages');
    if (stages[0]?.count === 0) {
      for (let i = 0; i < DEFAULT_SEEDS.stages.length; i++) {
        await this.exec(
          'INSERT INTO stages (name, position) VALUES (?, ?)',
          [DEFAULT_SEEDS.stages[i], i + 1]
        );
      }
    }

    // Check if channels is empty
    const channels = await this.query('SELECT COUNT(*) as count FROM channels');
    if (channels[0]?.count === 0) {
      for (const channel of DEFAULT_SEEDS.channels) {
        await this.exec('INSERT INTO channels (name) VALUES (?)', [channel]);
      }
    }

    // Check if content_types is empty
    const contentTypes = await this.query('SELECT COUNT(*) as count FROM content_types');
    if (contentTypes[0]?.count === 0) {
      for (const type of DEFAULT_SEEDS.content_types) {
        await this.exec('INSERT INTO content_types (name) VALUES (?)', [type]);
      }
    }
  }

  async exec(sql, params = []) {
    if (!this.db && !this.promiser) throw new Error('Database not initialized');

    if (this.isNode) {
      const stmt = this.db.prepare(sql);
      const info = stmt.run(...params);
      return {
        lastInsertRowId: Number(info.lastInsertRowid ?? 0),
        changes: Number(info.changes ?? 0),
      };
    }

    if (this.promiser) {
      await this.promiser('exec', {
        dbId: this.dbId,
        sql,
        bind: params && params.length > 0 ? params : undefined,
      });

      const idRes = await this.promiser('exec', {
        dbId: this.dbId,
        sql: 'SELECT last_insert_rowid() AS id, changes() AS changes',
        rowMode: 'object',
        resultRows: [],
      });

      const lastInsertRowId = Number(idRes.result?.resultRows?.[0]?.id ?? 0);
      const changes = Number(idRes.result?.resultRows?.[0]?.changes ?? 0);
      return { lastInsertRowId, changes };
    }

    // Direct Browser sqlite3 oo1 fallback
    const stmt = this.db.prepare(sql);
    try {
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      stmt.step();
    } finally {
      stmt.finalize();
    }

    const lastInsertRowId = Number(this.db.selectValue?.('SELECT last_insert_rowid()') ?? 0);
    const changes = Number(
      (typeof this.db.changes === 'function'
        ? this.db.changes()
        : this.db.selectValue?.('SELECT changes()')) ?? 0
    );

    return {
      lastInsertRowId,
      changes,
    };
  }

  async query(sql, params = []) {
    if (!this.db && !this.promiser) throw new Error('Database not initialized');

    if (this.isNode) {
      const stmt = this.db.prepare(sql);
      return stmt.all(...params);
    }

    if (this.promiser) {
      const res = await this.promiser('exec', {
        dbId: this.dbId,
        sql,
        bind: params && params.length > 0 ? params : undefined,
        rowMode: 'object',
        resultRows: [],
      });
      return res.result?.resultRows || [];
    }

    // Direct Browser sqlite3 oo1 fallback
    if (typeof this.db.selectObjects === 'function') {
      return this.db.selectObjects(sql, params || []);
    }

    const results = [];
    this.db.exec({
      sql,
      bind: params || [],
      rowMode: 'object',
      callback: (row) => {
        results.push(row);
      },
    });
    return results;
  }

  async queryOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async exportData() {
    const stages = await this.query('SELECT * FROM stages ORDER BY position ASC');
    const channels = await this.query('SELECT * FROM channels ORDER BY id ASC');
    const contentTypes = await this.query('SELECT * FROM content_types ORDER BY id ASC');
    const contents = await this.query('SELECT * FROM contents ORDER BY id ASC');

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      stages,
      channels,
      contentTypes,
      contents,
    };
  }

  async importData(payload) {
    if (!payload || !Array.isArray(payload.stages) || !Array.isArray(payload.contents)) {
      throw new Error('Formato de copia de seguridad no válido o dañado');
    }

    // Clear existing data and reimport within transaction
    await this.exec('DELETE FROM contents');
    await this.exec('DELETE FROM stages');
    await this.exec('DELETE FROM channels');
    await this.exec('DELETE FROM content_types');

    for (const stage of payload.stages) {
      await this.exec(
        'INSERT INTO stages (id, name, position) VALUES (?, ?, ?)',
        [stage.id, stage.name, stage.position]
      );
    }

    if (Array.isArray(payload.channels)) {
      for (const channel of payload.channels) {
        await this.exec(
          'INSERT INTO channels (id, name) VALUES (?, ?)',
          [channel.id, channel.name]
        );
      }
    }

    if (Array.isArray(payload.contentTypes)) {
      for (const type of payload.contentTypes) {
        await this.exec(
          'INSERT INTO content_types (id, name) VALUES (?, ?)',
          [type.id, type.name]
        );
      }
    }

    for (const content of payload.contents) {
      await this.exec(
        `INSERT INTO contents (id, title, publish_date, stage_id, channel_id, content_type_id, script, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          content.id,
          content.title,
          content.publish_date,
          content.stage_id,
          content.channel_id ?? null,
          content.content_type_id ?? null,
          content.script ?? '',
          content.created_at ?? new Date().toISOString(),
          content.updated_at ?? new Date().toISOString(),
        ]
      );
    }

    return true;
  }
}
