export class ContentService {
  constructor(repository) {
    this.repo = repository;
  }

  async validatePayload(payload, isUpdate = false) {
    if (!isUpdate || payload.title !== undefined) {
      const trimmedTitle = (payload.title ?? '').trim();
      if (!trimmedTitle) {
        throw new Error('El título es obligatorio');
      }
    }

    if (!isUpdate || payload.publish_date !== undefined) {
      const trimmedDate = (payload.publish_date ?? '').trim();
      if (!trimmedDate) {
        throw new Error('La fecha de publicación es obligatoria');
      }
    }

    if (!isUpdate || payload.channel_id !== undefined) {
      if (!payload.channel_id) {
        throw new Error('La red social es obligatoria');
      }
    }
  }

  async createContent(payload) {
    await this.validatePayload(payload, false);

    let stageId = payload.stage_id;
    if (!stageId) {
      const firstStage = await this.repo.queryOne(
        'SELECT id FROM stages ORDER BY position ASC, id ASC LIMIT 1'
      );
      if (!firstStage) {
        throw new Error('No existen etapas configuradas');
      }
      stageId = firstStage.id;
    }

    const title = payload.title.trim();
    const publishDate = payload.publish_date.trim();
    const channelId = payload.channel_id;
    const contentTypeId = payload.content_type_id ?? null;
    const script = payload.script ?? '';

    const res = await this.repo.exec(
      `INSERT INTO contents (title, publish_date, stage_id, channel_id, content_type_id, script)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, publishDate, stageId, channelId, contentTypeId, script]
    );

    return this.getContentById(res.lastInsertRowId);
  }

  async updateContent(id, payload) {
    await this.validatePayload(payload, true);

    const existing = await this.getContentById(id);
    if (!existing) {
      throw new Error(`Contenido con ID ${id} no encontrado`);
    }

    const title = payload.title !== undefined ? payload.title.trim() : existing.title;
    const publishDate = payload.publish_date !== undefined ? payload.publish_date.trim() : existing.publish_date;
    const stageId = payload.stage_id !== undefined ? payload.stage_id : existing.stage_id;
    const channelId = payload.channel_id !== undefined ? payload.channel_id : existing.channel_id;
    const contentTypeId = payload.content_type_id !== undefined ? payload.content_type_id : existing.content_type_id;
    const script = payload.script !== undefined ? payload.script : existing.script;

    await this.repo.exec(
      `UPDATE contents
       SET title = ?, publish_date = ?, stage_id = ?, channel_id = ?, content_type_id = ?, script = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, publishDate, stageId, channelId, contentTypeId, script, id]
    );

    return this.getContentById(id);
  }

  async updateContentStage(id, stageId) {
    await this.repo.exec(
      'UPDATE contents SET stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [stageId, id]
    );
    return this.getContentById(id);
  }

  async updateContentDate(id, publishDate) {
    const trimmed = (publishDate ?? '').trim();
    if (!trimmed) {
      throw new Error('La fecha de publicación no puede estar vacía');
    }
    await this.repo.exec(
      'UPDATE contents SET publish_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [trimmed, id]
    );
    return this.getContentById(id);
  }

  async deleteContent(id) {
    const res = await this.repo.exec('DELETE FROM contents WHERE id = ?', [id]);
    return res.changes > 0;
  }

  async getContentById(id) {
    const query = `
      SELECT
        c.*,
        s.name AS stage_name,
        s.position AS stage_position,
        ch.name AS channel_name,
        ct.name AS content_type_name
      FROM contents c
      LEFT JOIN stages s ON c.stage_id = s.id
      LEFT JOIN channels ch ON c.channel_id = ch.id
      LEFT JOIN content_types ct ON c.content_type_id = ct.id
      WHERE c.id = ?
    `;
    return this.repo.queryOne(query, [id]);
  }

  async getAllContents() {
    const query = `
      SELECT
        c.*,
        s.name AS stage_name,
        s.position AS stage_position,
        ch.name AS channel_name,
        ct.name AS content_type_name
      FROM contents c
      LEFT JOIN stages s ON c.stage_id = s.id
      LEFT JOIN channels ch ON c.channel_id = ch.id
      LEFT JOIN content_types ct ON c.content_type_id = ct.id
      ORDER BY c.publish_date ASC, c.id ASC
    `;
    return this.repo.query(query);
  }
}
