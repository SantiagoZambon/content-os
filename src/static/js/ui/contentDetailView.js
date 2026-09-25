import { MarkdownService } from '../services/markdownService.js';
import { confirmModal } from './modal.js';

export function renderContentDetailHtml(content) {
  if (!content) return '';

  const safeTitle = MarkdownService.escapeHtml(content.title);
  const safeDate = MarkdownService.escapeHtml(content.publish_date);
  const safeChannel = MarkdownService.escapeHtml(content.channel_name || 'Sin red');
  const safeStage = MarkdownService.escapeHtml(content.stage_name || 'Sin etapa');
  const safeType = MarkdownService.escapeHtml(content.content_type_name || 'Sin tipo');
  const scriptHtml = content.script
    ? MarkdownService.render(content.script)
    : '<p style="color:#666; font-style:italic;">No hay guión redactado para este contenido.</p>';

  return `
    <div class="detail-view-root">
        <div class="detail-header-card">
            <div class="detail-main-info">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div class="signature-halo-wrapper">
                        <div class="signature-halo-glow"></div>
                        <div class="signature-halo-ring"></div>
                        <div class="signature-halo-content" style="padding: 0.35rem 0.75rem; font-size:0.75rem; font-weight:600;">
                            ${safeChannel}
                        </div>
                    </div>
                    <span class="kanban-card-badge">${safeStage}</span>
                    <span class="kanban-card-badge" style="background:transparent;">${safeType}</span>
                </div>
                <h2 class="detail-title">${safeTitle}</h2>
                <div class="detail-meta-list">
                    <span>Fecha programada: <strong>${safeDate}</strong></span>
                </div>
            </div>

            <div style="display:flex; gap:0.75rem; align-items:center; flex-wrap:wrap;">
                <a href="#/content/edit/${content.id}" class="content-os-btn content-os-btn-primary">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <span>Editar</span>
                </a>
                <button type="button" id="btn-delete-content" class="content-os-btn content-os-btn-danger">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Eliminar</span>
                </button>
                <a href="#/kanban" class="content-os-btn">Volver</a>
            </div>
        </div>

        <div class="detail-script-card">
            <h3 class="detail-script-title">Guión de la publicación</h3>
            <div class="detail-script-content">
                ${scriptHtml}
            </div>
        </div>
    </div>
  `;
}

export class ContentDetailView {
  constructor(container, { contentService, router }) {
    this.container = container;
    this.contentService = contentService;
    this.router = router;
  }

  async mount({ id } = {}) {
    if (!id) {
      this.router.navigate('#/kanban');
      return;
    }

    const content = await this.contentService.getContentById(id);
    if (!content) {
      this.router.navigate('#/kanban');
      return;
    }

    this.container.innerHTML = renderContentDetailHtml(content);

    const deleteBtn = document.getElementById('btn-delete-content');
    deleteBtn?.addEventListener('click', async () => {
      const confirmed = await confirmModal({
        title: '¿Eliminar contenido?',
        message: `¿Estás seguro de que deseas eliminar permanentemente "${content.title}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        isDanger: true,
      });

      if (confirmed) {
        await this.contentService.deleteContent(content.id);
        this.router.navigate('#/kanban');
      }
    });
  }
}
