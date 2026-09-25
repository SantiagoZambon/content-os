import { MarkdownService } from '../services/markdownService.js';

export function renderContentFormHtml({
  content = null,
  stages = [],
  channels = [],
  contentTypes = [],
  isNew = true,
}) {
  const titleVal = content?.title ? MarkdownService.escapeHtml(content.title) : '';
  const dateVal = content?.publish_date ? MarkdownService.escapeHtml(content.publish_date) : '';
  const scriptVal = content?.script ? MarkdownService.escapeHtml(content.script) : '';
  const selectedChannelId = content?.channel_id ?? '';
  const selectedStageId = content?.stage_id ?? (stages[0]?.id ?? '');
  const selectedTypeId = content?.content_type_id ?? '';

  const headerTitle = isNew ? 'Nuevo Contenido' : 'Editar Contenido';
  const submitText = isNew ? 'Crear Contenido' : 'Guardar cambios';

  const channelOptions = channels
    .map(
      (c) =>
        `<option value="${c.id}" ${Number(c.id) === Number(selectedChannelId) ? 'selected' : ''}>${MarkdownService.escapeHtml(c.name)}</option>`
    )
    .join('');

  const stageOptions = stages
    .map(
      (s) =>
        `<option value="${s.id}" ${Number(s.id) === Number(selectedStageId) ? 'selected' : ''}>${MarkdownService.escapeHtml(s.name)}</option>`
    )
    .join('');

  const typeOptions = [
    `<option value="">Sin tipo específico</option>`,
    ...contentTypes.map(
      (t) =>
        `<option value="${t.id}" ${Number(t.id) === Number(selectedTypeId) ? 'selected' : ''}>${MarkdownService.escapeHtml(t.name)}</option>`
    ),
  ].join('');

  const previewInitialHtml = scriptVal ? MarkdownService.render(content.script) : '<p style="color:#666;">Vista previa del guión...</p>';

  return `
    <div class="form-view-root">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1.25rem;">
            <h2 class="content-os-title" style="font-size:1.6rem;">${headerTitle}</h2>
            <a href="#/kanban" class="content-os-btn content-os-btn-sm">Volver</a>
        </div>

        <form id="content-edit-form" novalidate>
            <div class="form-layout-grid">
                <div class="form-sidebar">
                    <div class="form-field">
                        <label for="form-title" class="form-label">Título *</label>
                        <input type="text" id="form-title" class="content-os-input" value="${titleVal}" placeholder="Título del contenido" required>
                        <span class="form-input-error" id="error-title" style="display:none;"></span>
                    </div>

                    <div class="form-field">
                        <label for="form-publish-date" class="form-label">Fecha de publicación *</label>
                        <input type="date" id="form-publish-date" class="content-os-input" value="${dateVal}" required>
                        <span class="form-input-error" id="error-publish-date" style="display:none;"></span>
                    </div>

                    <div class="form-field">
                        <label for="form-channel" class="form-label">Red Social / Canal *</label>
                        <select id="form-channel" class="content-os-select" required>
                            <option value="">Seleccionar red social...</option>
                            ${channelOptions}
                        </select>
                        <span class="form-input-error" id="error-channel" style="display:none;"></span>
                    </div>

                    <div class="form-field">
                        <label for="form-stage" class="form-label">Etapa de producción</label>
                        <select id="form-stage" class="content-os-select">
                            ${stageOptions}
                        </select>
                    </div>

                    <div class="form-field">
                        <label for="form-content-type" class="form-label">Tipo de contenido</label>
                        <select id="form-content-type" class="content-os-select">
                            ${typeOptions}
                        </select>
                    </div>

                    <div style="display:flex; gap:0.75rem; margin-top:1rem;">
                        <button type="submit" class="content-os-btn content-os-btn-primary" style="flex:1;">${submitText}</button>
                        <a href="#/kanban" class="content-os-btn">Cancelar</a>
                    </div>
                </div>

                <div class="form-editor-panel">
                    <div class="form-editor-toolbar">
                        <button type="button" class="form-toolbar-btn" data-action="h1">H1</button>
                        <button type="button" class="form-toolbar-btn" data-action="h2">H2</button>
                        <button type="button" class="form-toolbar-btn" data-action="h3">H3</button>
                        <button type="button" class="form-toolbar-btn" data-action="bold"><strong>B</strong></button>
                        <button type="button" class="form-toolbar-btn" data-action="italic"><em>I</em></button>
                        <button type="button" class="form-toolbar-btn" data-action="list">Lista</button>
                        <button type="button" class="form-toolbar-btn" data-action="quote">Cita</button>
                        <button type="button" class="form-toolbar-btn" data-action="code">&lt;&gt;</button>
                    </div>
                    <div class="form-editor-body">
                        <textarea id="form-script-textarea" class="form-textarea" placeholder="Escribe el guión en Markdown...">${scriptVal}</textarea>
                        <div id="form-script-preview" class="form-markdown-preview">${previewInitialHtml}</div>
                    </div>
                </div>
            </div>
        </form>
    </div>
  `;
}

export class ContentFormView {
  constructor(container, { contentService, settingsService, router }) {
    this.container = container;
    this.contentService = contentService;
    this.settingsService = settingsService;
    this.router = router;
  }

  async mount({ id = null, isNew = true } = {}) {
    const stages = await this.settingsService.getStages();
    const channels = await this.settingsService.getChannels();
    const contentTypes = await this.settingsService.getContentTypes();

    let content = null;
    if (!isNew && id) {
      content = await this.contentService.getContentById(id);
      if (!content) {
        this.router.navigate('#/kanban');
        return;
      }
    }

    this.container.innerHTML = renderContentFormHtml({
      content,
      stages,
      channels,
      contentTypes,
      isNew,
    });

    this.attachEvents({ content, isNew, id });
  }

  attachEvents({ content, isNew, id }) {
    const form = document.getElementById('content-edit-form');
    const textarea = document.getElementById('form-script-textarea');
    const preview = document.getElementById('form-script-preview');
    const titleInput = document.getElementById('form-title');
    const dateInput = document.getElementById('form-publish-date');
    const channelSelect = document.getElementById('form-channel');
    const stageSelect = document.getElementById('form-stage');
    const typeSelect = document.getElementById('form-content-type');

    // Live preview
    textarea?.addEventListener('input', () => {
      preview.innerHTML = MarkdownService.render(textarea.value);
    });

    // Toolbar actions
    const toolbarButtons = document.querySelectorAll('.form-toolbar-btn');
    for (const btn of toolbarButtons) {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        let res;

        switch (action) {
          case 'h1':
            res = MarkdownService.applyFormat(textarea.value, start, end, '# ', '');
            break;
          case 'h2':
            res = MarkdownService.applyFormat(textarea.value, start, end, '## ', '');
            break;
          case 'h3':
            res = MarkdownService.applyFormat(textarea.value, start, end, '### ', '');
            break;
          case 'bold':
            res = MarkdownService.applyFormat(textarea.value, start, end, '**', '**');
            break;
          case 'italic':
            res = MarkdownService.applyFormat(textarea.value, start, end, '*', '*');
            break;
          case 'list':
            res = MarkdownService.applyFormat(textarea.value, start, end, '- ', '');
            break;
          case 'quote':
            res = MarkdownService.applyFormat(textarea.value, start, end, '> ', '');
            break;
          case 'code':
            res = MarkdownService.applyFormat(textarea.value, start, end, '`', '`');
            break;
        }

        if (res) {
          textarea.value = res.text;
          textarea.focus();
          textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
          preview.innerHTML = MarkdownService.render(textarea.value);
        }
      });
    }

    // Form submit
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      let hasErrors = false;
      const title = titleInput.value.trim();
      const date = dateInput.value.trim();
      const channelId = channelSelect.value ? Number(channelSelect.value) : null;
      const stageId = stageSelect.value ? Number(stageSelect.value) : null;
      const typeId = typeSelect.value ? Number(typeSelect.value) : null;
      const script = textarea.value;

      const titleErr = document.getElementById('error-title');
      const dateErr = document.getElementById('error-publish-date');
      const channelErr = document.getElementById('error-channel');

      if (!title) {
        titleErr.textContent = 'El título es obligatorio';
        titleErr.style.display = 'block';
        hasErrors = true;
      } else {
        titleErr.style.display = 'none';
      }

      if (!date) {
        dateErr.textContent = 'La fecha de publicación es obligatoria';
        dateErr.style.display = 'block';
        hasErrors = true;
      } else {
        dateErr.style.display = 'none';
      }

      if (!channelId) {
        channelErr.textContent = 'La red social es obligatoria';
        channelErr.style.display = 'block';
        hasErrors = true;
      } else {
        channelErr.style.display = 'none';
      }

      if (hasErrors) return;

      try {
        if (isNew) {
          const created = await this.contentService.createContent({
            title,
            publish_date: date,
            channel_id: channelId,
            stage_id: stageId,
            content_type_id: typeId,
            script,
          });
          this.router.navigate(`#/content/view/${created.id}`);
        } else {
          const updated = await this.contentService.updateContent(id, {
            title,
            publish_date: date,
            channel_id: channelId,
            stage_id: stageId,
            content_type_id: typeId,
            script,
          });
          this.router.navigate(`#/content/view/${updated.id}`);
        }
      } catch (err) {
        console.error('Error saving content:', err);
      }
    });
  }
}
