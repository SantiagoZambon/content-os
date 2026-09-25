export class BackupService {
  constructor(repository) {
    this.repo = repository;
  }

  async exportBackup() {
    const data = await this.repo.exportData();
    return JSON.stringify(data, null, 2);
  }

  async triggerDownload(filename = null) {
    const jsonStr = await this.exportBackup();
    const dateStr = new Date().toISOString().slice(0, 10);
    const finalFilename = filename || `content-os-backup-${dateStr}.json`;

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    return jsonStr;
  }

  async importBackup(jsonString) {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('El archivo de copia de seguridad no tiene un formato JSON válido');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('El archivo de copia de seguridad no tiene un formato JSON válido');
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.stages) ||
      !Array.isArray(parsed.contents)
    ) {
      throw new Error('El archivo de copia de seguridad no contiene la estructura requerida');
    }

    await this.repo.importData(parsed);
    return true;
  }
}
