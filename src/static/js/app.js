import { Repository } from './db/repository.js';
import { SettingsService } from './services/settingsService.js';
import { ContentService } from './services/contentService.js';
import { FilterService } from './services/filterService.js';
import { BackupService } from './services/backupService.js';
import { DragDropController } from './ui/dragDrop.js';
import { AppRouter } from './ui/appRouter.js';
import { KanbanView } from './ui/kanbanView.js';
import { CalendarView } from './ui/calendarView.js';
import { ContentFormView } from './ui/contentFormView.js';
import { ContentDetailView } from './ui/contentDetailView.js';
import { SettingsView } from './ui/settingsView.js';

export async function populateFilterBar(settingsService, filterService) {
  const filterBar = document.getElementById('app-filter-bar');
  if (!filterBar) return;

  const channelSelect = document.getElementById('filter-channel');
  const stageSelect = document.getElementById('filter-stage');
  const typeSelect = document.getElementById('filter-type');
  const searchInput = document.getElementById('filter-search');
  const startDateInput = document.getElementById('filter-start-date');
  const endDateInput = document.getElementById('filter-end-date');
  const resetBtn = document.getElementById('btn-reset-filters');

  const channels = await settingsService.getChannels();
  const stages = await settingsService.getStages();
  const types = await settingsService.getContentTypes();

  if (channelSelect) {
    channelSelect.innerHTML = `<option value="">Todas las redes</option>` +
      channels.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
    channelSelect.addEventListener('change', () => {
      filterService.setFilter('channel_id', channelSelect.value || null);
    });
  }

  if (stageSelect) {
    stageSelect.innerHTML = `<option value="">Todas las etapas</option>` +
      stages.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
    stageSelect.addEventListener('change', () => {
      filterService.setFilter('stage_id', stageSelect.value || null);
    });
  }

  if (typeSelect) {
    typeSelect.innerHTML = `<option value="">Todos los tipos</option>` +
      types.map((t) => `<option value="${t.id}">${t.name}</option>`).join('');
    typeSelect.addEventListener('change', () => {
      filterService.setFilter('content_type_id', typeSelect.value || null);
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterService.setFilter('search_query', searchInput.value || null);
    });
  }

  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      filterService.setFilter('start_date', startDateInput.value || null);
    });
  }

  if (endDateInput) {
    endDateInput.addEventListener('change', () => {
      filterService.setFilter('end_date', endDateInput.value || null);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filterService.resetFilters();
      if (channelSelect) channelSelect.value = '';
      if (stageSelect) stageSelect.value = '';
      if (typeSelect) typeSelect.value = '';
      if (searchInput) searchInput.value = '';
      if (startDateInput) startDateInput.value = '';
      if (endDateInput) endDateInput.value = '';
    });
  }
}

export async function bootstrapApp() {
  const repo = new Repository();
  await repo.init();

  const settingsService = new SettingsService(repo);
  const contentService = new ContentService(repo);
  const filterService = new FilterService(contentService);
  const backupService = new BackupService(repo);
  const dragDropController = new DragDropController();

  const viewContainer = document.getElementById('app-view-container');
  const filterBar = document.getElementById('app-filter-bar');

  let currentView = null;

  const switchView = async (createViewFn, showFilters = false, params = {}) => {
    if (currentView && typeof currentView.destroy === 'function') {
      currentView.destroy();
    }

    if (filterBar) {
      filterBar.style.display = showFilters ? 'flex' : 'none';
    }

    if (viewContainer) {
      viewContainer.innerHTML = '';
      currentView = createViewFn();
      await currentView.mount(params);
    }
  };

  const router = new AppRouter({
    kanban: async (params) => {
      await switchView(
        () => new KanbanView(viewContainer, {
          contentService,
          settingsService,
          filterService,
          dragDropController,
          router,
        }),
        true,
        params
      );
    },
    calendar: async (params) => {
      await switchView(
        () => new CalendarView(viewContainer, {
          contentService,
          filterService,
          dragDropController,
          router,
        }),
        true,
        params
      );
    },
    'content-form': async (params) => {
      await switchView(
        () => new ContentFormView(viewContainer, {
          contentService,
          settingsService,
          router,
        }),
        false,
        params
      );
    },
    'content-detail': async (params) => {
      await switchView(
        () => new ContentDetailView(viewContainer, {
          contentService,
          router,
        }),
        false,
        params
      );
    },
    settings: async (params) => {
      await switchView(
        () => new SettingsView(viewContainer, {
          settingsService,
          backupService,
          router,
        }),
        false,
        params
      );
    },
  });

  await populateFilterBar(settingsService, filterService);
  router.init();

  return {
    repo,
    settingsService,
    contentService,
    filterService,
    backupService,
    dragDropController,
    router,
  };
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    bootstrapApp().catch((err) => console.error('App bootstrap failed:', err));
  });
}
