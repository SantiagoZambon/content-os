import { MarkdownService } from '../services/markdownService.js';
import { confirmModal, alertModal } from './modal.js';

export function renderSettingsHtml({ stages = [], channels = [], contentTypes = [] }) {
  const stagesListHtml = stages
    .map(
      (s) => `
        <div class="settings-item-row">
            <span>${MarkdownService.escapeHtml(s.name)}</span>
            <button type="button" class="content-os-btn content-os-btn-sm content-os-btn-danger" data-delete-stage="${s.id}" aria-label="Eliminar etapa">✕</button>
        </div>
      `
    )
    .join('');

  const channelsListHtml = channels
    .map(
      (c) => `
        <div class="settings-item-row">
            <span>${MarkdownService.escapeHtml(c.name)}</span>
            <button type="button" class="content-os-btn content-os-btn-sm content-os-btn-danger" data-delete-channel="${c.id}" aria-label="Eliminar red social">✕</button>
        </div>
      `
    )
    .join('');

  const typesListHtml = contentTypes
    .map(
      (t) => `
        <div class="settings-item-row">
            <span>${MarkdownService.escapeHtml(t.name)}</span>
            <button type="button" class="content-os-btn content-os-btn-sm content-os-btn-danger" data-delete-type="${t.id}" aria-label="Eliminar tipo de contenido">✕</button>
        </div>
      `
    )
    .join('');

  return `
    <div class="settings-view-root">
        <div style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1rem;">
            <h2 class="content-os-title" style="font-size:1.6rem;">Configuración y Ajustes</h2>
            <p style="color:#9c9c9a; margin:0.35rem 0 0 0; font-size:0.875rem;">Administra tus etapas, canales, tipos de publicación y copias de seguridad locales.</p>
        </div>

        <div class="settings-grid">
            <div class="settings-card">
                <h3 class="settings-card-title">Etapas del Tablero</h3>
                <div class="settings-item-list">
                    ${stagesListHtml}
                </div>
                <form id="form-add-stage" class="settings-add-form">
                    <input type="text" id="input-new-stage" class="content-os-input" placeholder="Nueva etapa..." style="flex:1;" required>
                    <button type="submit" class="content-os-btn content-os-btn-sm content-os-btn-primary">Añadir</button>
                </form>
            </div>

            <div class="settings-card">
                <h3 class="settings-card-title">Redes Sociales</h3>
                <div class="settings-item-list">
                    ${channelsListHtml}
                </div>
                <form id="form-add-channel" class="settings-add-form">
                    <input type="text" id="input-new-channel" class="content-os-input" placeholder="Nueva red..." style="flex:1;" required>
                    <button type="submit" class="content-os-btn content-os-btn-sm content-os-btn-primary">Añadir</button>
                </form>
            </div>

            <div class="settings-card">
                <h3 class="settings-card-title">Tipos de Contenido</h3>
                <div class="settings-item-list">
                    ${typesListHtml}
                </div>
                <form id="form-add-type" class="settings-add-form">
                    <input type="text" id="input-new-type" class="content-os-input" placeholder="Nuevo tipo..." style="flex:1;" required>
                    <button type="submit" class="content-os-btn content-os-btn-sm content-os-btn-primary">Añadir</button>
                </form>
            </div>
        </div>

        <div class="settings-card">
            <h3 class="settings-card-title">Copias de Seguridad (Backup)</h3>
            <p style="color:#9c9c9a; font-size:0.875rem; margin:0;">Exporta tus datos a un archivo JSON local o restaura una copia de seguridad previamente guardada.</p>
            <div class="settings-backup-panel">
                <button type="button" id="btn-export-backup" class="content-os-btn content-os-btn-primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Exportar base de datos</span>
                </button>

                <label class="content-os-btn" style="cursor:pointer;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <span>Importar copia de seguridad</span>
                    <input type="file" id="btn-import-backup" accept=".json" style="display:none;">
                </label>
            </div>
        </div>
    </div>
  `;
}

export class SettingsView {
  constructor(container, { settingsService, backupService, router }) {
    this.container = container;
    this.settingsService = settingsService;
    this.backupService = backupService;
    this.router = router;
  }

  async mount() {
    await this.render();
  }

  async render() {
    const stages = await this.settingsService.getStages();
    const channels = await this.settingsService.getChannels();
    const contentTypes = await this.settingsService.getContentTypes();

    this.container.innerHTML = renderSettingsHtml({
      stages,
      channels,
      contentTypes,
    });

    this.setupInteractions(stages, channels, contentTypes);
  }

  setupInteractions(stages, channels, contentTypes) {
    // Add stage
    const addStageForm = this.container.querySelector('#form-add-stage');
    const inputNewStage = this.container.querySelector('#input-new-stage');
    addStageForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.settingsService.createStage(inputNewStage.value);
        await this.render();
      } catch (err) {
        await alertModal({ title: 'Error', message: err.message });
      }
    });

    // Delete stage
    const deleteStageBtns = this.container.querySelectorAll('[data-delete-stage]');
    for (const btn of deleteStageBtns) {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.deleteStage);
        const stage = stages.find((s) => s.id === id);

        const confirmed = await confirmModal({
          title: '¿Eliminar etapa?',
          message: `¿Deseas eliminar la etapa "${stage?.name}"? Los contenidos asociados pasarán automáticamente a la primera etapa disponible.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          isDanger: true,
        });

        if (confirmed) {
          try {
            await this.settingsService.deleteStage(id);
            await this.render();
          } catch (err) {
            await alertModal({ title: 'Error', message: err.message });
          }
        }
      });
    }

    // Add channel
    const addChannelForm = this.container.querySelector('#form-add-channel');
    const inputNewChannel = this.container.querySelector('#input-new-channel');
    addChannelForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.settingsService.createChannel(inputNewChannel.value);
        await this.render();
      } catch (err) {
        await alertModal({ title: 'Error', message: err.message });
      }
    });

    // Delete channel
    const deleteChannelBtns = this.container.querySelectorAll('[data-delete-channel]');
    for (const btn of deleteChannelBtns) {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.deleteChannel);
        const channel = channels.find((c) => c.id === id);

        const confirmed = await confirmModal({
          title: '¿Eliminar red social?',
          message: `¿Deseas eliminar "${channel?.name}"? Los contenidos asociados mantendrán su información sin red asignada.`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          isDanger: true,
        });

        if (confirmed) {
          try {
            await this.settingsService.deleteChannel(id);
            await this.render();
          } catch (err) {
            await alertModal({ title: 'Error', message: err.message });
          }
        }
      });
    }

    // Add type
    const addTypeForm = this.container.querySelector('#form-add-type');
    const inputNewType = this.container.querySelector('#input-new-type');
    addTypeForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await this.settingsService.createContentType(inputNewType.value);
        await this.render();
      } catch (err) {
        await alertModal({ title: 'Error', message: err.message });
      }
    });

    // Delete type
    const deleteTypeBtns = this.container.querySelectorAll('[data-delete-type]');
    for (const btn of deleteTypeBtns) {
      btn.addEventListener('click', async () => {
        const id = Number(btn.dataset.deleteType);
        const type = contentTypes.find((t) => t.id === id);

        const confirmed = await confirmModal({
          title: '¿Eliminar tipo de contenido?',
          message: `¿Deseas eliminar "${type?.name}"?`,
          confirmText: 'Eliminar',
          cancelText: 'Cancelar',
          isDanger: true,
        });

        if (confirmed) {
          try {
            await this.settingsService.deleteContentType(id);
            await this.render();
          } catch (err) {
            await alertModal({ title: 'Error', message: err.message });
          }
        }
      });
    }

    // Export backup
    const exportBtn = this.container.querySelector('#btn-export-backup');
    exportBtn?.addEventListener('click', async () => {
      try {
        await this.backupService.triggerDownload();
      } catch (err) {
        await alertModal({ title: 'Error al exportar', message: err.message });
      }
    });

    // Import backup
    const importInput = this.container.querySelector('#btn-import-backup');
    importInput?.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const confirmed = await confirmModal({
        title: '¿Restaurar copia de seguridad?',
        message: 'Esta acción sobrescribirá todos los datos actuales con los del archivo seleccionado. ¿Deseas continuar?',
        confirmText: 'Restaurar',
        cancelText: 'Cancelar',
        isDanger: true,
      });

      if (!confirmed) {
        importInput.value = '';
        return;
      }

      try {
        const text = await file.text();
        await this.backupService.importBackup(text);
        await alertModal({
          title: 'Copia restaurada',
          message: 'La base de datos fue restaurada exitosamente.',
        });
        await this.render();
      } catch (err) {
        await alertModal({ title: 'Error al importar', message: err.message });
      } finally {
        importInput.value = '';
      }
    });
  }
}
