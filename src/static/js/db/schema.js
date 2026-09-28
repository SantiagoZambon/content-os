export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS stages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    position INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS channels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#FFFFFF',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    publish_date TEXT NOT NULL,
    stage_id INTEGER NOT NULL,
    channel_id INTEGER,
    content_type_id INTEGER,
    script TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE RESTRICT,
    FOREIGN KEY (channel_id) REFERENCES channels(id) ON DELETE SET NULL,
    FOREIGN KEY (content_type_id) REFERENCES content_types(id) ON DELETE SET NULL
);
`;

export const DEFAULT_SEEDS = {
  stages: ['Idea', 'Guion', 'Grabacion', 'Edicion', 'Publicado'],
  channels: ['YouTube', 'Instagram', 'TikTok', 'Linkedin', 'X'],
  content_types: ['Video', 'Publicacion', 'Vertical', 'Articulo'],
};

export const DEFAULT_CHANNEL_COLORS = {
  YouTube: '#FF0033',
  Instagram: '#E1306C',
  TikTok: '#00F2FE',
  Linkedin: '#0A66C2',
  X: '#F5F5F4',
};
