import { MarkdownService } from '../services/markdownService.js';

export function renderKanbanHtml({ stages = [], contentsByStage = {} }) {
  const columnsHtml = stages
    .map((stage) => {
      const cards = contentsByStage[stage.id] || [];
      const safeStageName = MarkdownService.escapeHtml(stage.name);

      const cardsHtml = cards
        .map((content) => {
          const safeTitle = MarkdownService.escapeHtml(content.title);
          const safeChannel = MarkdownService.escapeHtml(content.channel_name || 'Sin red');
          const safeType = MarkdownService.escapeHtml(content.content_type_name || 'General');
          const safeDate = MarkdownService.escapeHtml(content.publish_date);

          return `
            <div class="kanban-card" data-content-id="${content.id}" role="button" tabindex="0">
                <div class="kanban-card-badges">
                    <span class="kanban-card-badge">${safeChannel}</span>
                    <span class="kanban-card-badge" style="background:transparent;">${safeType}</span>
                </div>
                <h4 class="kanban-card-title">${safeTitle}</h4>
                <div class="kanban-card-footer">
                    <span>${safeDate}</span>
                </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="kanban-column" data-stage-id="${stage.id}">
            <div class="kanban-column-header">
                <h3 class="kanban-column-title">${safeStageName}</h3>
                <span class="kanban-column-count">${cards.length}</span>
            </div>
            <div class="kanban-cards-list" data-stage-id="${stage.id}">
                ${cardsHtml}
            </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="kanban-view-root">
        <div class="kanban-columns-container">
            ${columnsHtml}
        </div>
    </div>
  `;
}

export class KanbanView {
  constructor(container, { contentService, settingsService, filterService, dragDropController, router }) {
    this.container = container;
    this.contentService = contentService;
    this.settingsService = settingsService;
    this.filterService = filterService;
    this.dragDrop = dragDropController;
    this.router = router;
    this.unsubscribeFilter = null;
  }

  async mount() {
    await this.render();

    if (this.unsubscribeFilter) {
      this.unsubscribeFilter();
    }
    this.unsubscribeFilter = this.filterService.subscribe(() => {
      this.render();
    });
  }

  async render() {
    const stages = await this.settingsService.getStages();
    const contents = await this.filterService.getFilteredContents();

    const contentsByStage = {};
    for (const stage of stages) {
      contentsByStage[stage.id] = [];
    }
    for (const content of contents) {
      if (!contentsByStage[content.stage_id]) {
        contentsByStage[content.stage_id] = [];
      }
      contentsByStage[content.stage_id].push(content);
    }

    this.container.innerHTML = renderKanbanHtml({
      stages,
      contentsByStage,
    });

    this.setupInteractions(stages, contents);
  }

  setupInteractions(stages, contents) {
    // Card navigation on click
    const cards = this.container.querySelectorAll('.kanban-card');
    for (const card of cards) {
      const contentId = Number(card.dataset.contentId);
      const content = contents.find((c) => c.id === contentId);

      card.addEventListener('click', (e) => {
        if (!card.classList.contains('is-dragging')) {
          this.router.navigate(`#/content/view/${contentId}`);
        }
      });

      // Draggable registration
      if (this.dragDrop && content) {
        this.dragDrop.makeDraggable(card, {
          data: {
            type: 'content-card',
            contentId: content.id,
            currentStageId: content.stage_id,
          },
        });
      }
    }

    // Drop zone registration on columns
    const columns = this.container.querySelectorAll('.kanban-column');
    for (const col of columns) {
      const stageId = Number(col.dataset.stageId);

      if (this.dragDrop) {
        this.dragDrop.makeDropZone(col, {
          accepts: ['content-card'],
          onDrop: async (data) => {
            if (data.currentStageId !== stageId) {
              await this.contentService.updateContentStage(data.contentId, stageId);
              await this.render();
            }
          },
        });
      }
    }
  }

  destroy() {
    if (this.unsubscribeFilter) {
      this.unsubscribeFilter();
      this.unsubscribeFilter = null;
    }
  }
}
