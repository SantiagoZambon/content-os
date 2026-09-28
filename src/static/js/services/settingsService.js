export class SettingsService {
  constructor(repository) {
    this.repo = repository;
  }

  async getStages() {
    return this.repo.query('SELECT * FROM stages ORDER BY position ASC, id ASC');
  }

  async getStageById(id) {
    return this.repo.queryOne('SELECT * FROM stages WHERE id = ?', [id]);
  }

  async createStage(name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre de la etapa no puede estar vacío');
    }

    const existing = await this.repo.queryOne('SELECT id FROM stages WHERE LOWER(name) = LOWER(?)', [trimmed]);
    if (existing) {
      throw new Error(`Ya existe una etapa con el nombre "${trimmed}"`);
    }

    const posRow = await this.repo.queryOne('SELECT MAX(position) as maxPos FROM stages');
    const nextPos = (posRow?.maxPos ?? 0) + 1;

    const res = await this.repo.exec('INSERT INTO stages (name, position) VALUES (?, ?)', [trimmed, nextPos]);
    return this.getStageById(res.lastInsertRowId);
  }

  async updateStage(id, name, position = null) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre de la etapa no puede estar vacío');
    }

    const existing = await this.repo.queryOne(
      'SELECT id FROM stages WHERE LOWER(name) = LOWER(?) AND id != ?',
      [trimmed, id]
    );
    if (existing) {
      throw new Error(`Ya existe una etapa con el nombre "${trimmed}"`);
    }

    if (position !== null) {
      await this.repo.exec('UPDATE stages SET name = ?, position = ? WHERE id = ?', [trimmed, position, id]);
    } else {
      await this.repo.exec('UPDATE stages SET name = ? WHERE id = ?', [trimmed, id]);
    }

    return this.getStageById(id);
  }

  async deleteStage(id) {
    const stages = await this.getStages();
    if (stages.length <= 1) {
      throw new Error('Debe existir al menos una etapa activa');
    }

    // Determine target fallback stage (the first available stage that isn't the deleted one)
    const fallbackStage = stages.find((s) => s.id !== id);

    // Reassign any contents assigned to this stage to fallbackStage (AC-23)
    if (fallbackStage) {
      await this.repo.exec('UPDATE contents SET stage_id = ? WHERE stage_id = ?', [fallbackStage.id, id]);
    }

    await this.repo.exec('DELETE FROM stages WHERE id = ?', [id]);
    return true;
  }

  async getChannels() {
    return this.repo.query('SELECT * FROM channels ORDER BY id ASC');
  }

  async getChannelById(id) {
    return this.repo.queryOne('SELECT * FROM channels WHERE id = ?', [id]);
  }

  async createChannel(name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre de la red social no puede estar vacío');
    }

    const existing = await this.repo.queryOne('SELECT id FROM channels WHERE LOWER(name) = LOWER(?)', [trimmed]);
    if (existing) {
      throw new Error(`Ya existe una red social con el nombre "${trimmed}"`);
    }

    const res = await this.repo.exec('INSERT INTO channels (name) VALUES (?)', [trimmed]);
    return this.getChannelById(res.lastInsertRowId);
  }

  async updateChannel(id, name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre de la red social no puede estar vacío');
    }

    const existing = await this.repo.queryOne(
      'SELECT id FROM channels WHERE LOWER(name) = LOWER(?) AND id != ?',
      [trimmed, id]
    );
    if (existing) {
      throw new Error(`Ya existe una red social con el nombre "${trimmed}"`);
    }

    await this.repo.exec('UPDATE channels SET name = ? WHERE id = ?', [trimmed, id]);
    return this.getChannelById(id);
  }

  async deleteChannel(id) {
    // Set channel_id to NULL on assigned contents (AC-24)
    await this.repo.exec('UPDATE contents SET channel_id = NULL WHERE channel_id = ?', [id]);
    await this.repo.exec('DELETE FROM channels WHERE id = ?', [id]);
    return true;
  }

  async getContentTypes() {
    return this.repo.query('SELECT * FROM content_types ORDER BY id ASC');
  }

  async getContentTypeById(id) {
    return this.repo.queryOne('SELECT * FROM content_types WHERE id = ?', [id]);
  }

  async createContentType(name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre del tipo de contenido no puede estar vacío');
    }

    const existing = await this.repo.queryOne(
      'SELECT id FROM content_types WHERE LOWER(name) = LOWER(?)',
      [trimmed]
    );
    if (existing) {
      throw new Error(`Ya existe un tipo de contenido con el nombre "${trimmed}"`);
    }

    const res = await this.repo.exec('INSERT INTO content_types (name) VALUES (?)', [trimmed]);
    return this.getContentTypeById(res.lastInsertRowId);
  }

  async updateContentType(id, name) {
    const trimmed = (name ?? '').trim();
    if (!trimmed) {
      throw new Error('El nombre del tipo de contenido no puede estar vacío');
    }

    const existing = await this.repo.queryOne(
      'SELECT id FROM content_types WHERE LOWER(name) = LOWER(?) AND id != ?',
      [trimmed, id]
    );
    if (existing) {
      throw new Error(`Ya existe un tipo de contenido con el nombre "${trimmed}"`);
    }

    await this.repo.exec('UPDATE content_types SET name = ? WHERE id = ?', [trimmed, id]);
    return this.getContentTypeById(id);
  }

  async deleteContentType(id) {
    // Set content_type_id to NULL on assigned contents (AC-24)
    await this.repo.exec('UPDATE contents SET content_type_id = NULL WHERE content_type_id = ?', [id]);
    await this.repo.exec('DELETE FROM content_types WHERE id = ?', [id]);
    return true;
  }
}
