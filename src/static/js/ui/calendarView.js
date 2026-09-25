import { MarkdownService } from '../services/markdownService.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function formatIsoDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function getCalendarDays(year, month) {
  const days = [];
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, d);
    days.push({
      dateStr: formatIsoDate(prevDate.getFullYear(), prevDate.getMonth(), d),
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) {
    const dateStr = formatIsoDate(year, month, d);
    days.push({
      dateStr,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d);
    days.push({
      dateStr: formatIsoDate(nextDate.getFullYear(), nextDate.getMonth(), d),
      dayNumber: d,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
}

export function renderCalendarHtml({ year, month, days = [], contentsByDate = {} }) {
  const monthName = MONTH_NAMES[month];
  const headerDaysHtml = DAY_NAMES.map((name) => `<div class="calendar-day-header">${name}</div>`).join('');

  const cellsHtml = days
    .map((day) => {
      const items = contentsByDate[day.dateStr] || [];
      const outsideClass = day.isCurrentMonth ? '' : 'is-outside-month';
      const todayClass = day.isToday ? 'is-today' : '';

      const itemsHtml = items
        .map((item) => {
          const safeTitle = MarkdownService.escapeHtml(item.title);
          const safeChannel = MarkdownService.escapeHtml(item.channel_name || 'Sin red');

          return `
            <div class="calendar-event-item" data-content-id="${item.id}" role="button" tabindex="0">
                <span class="calendar-event-title">${safeTitle}</span>
                <span class="calendar-event-tag">${safeChannel}</span>
            </div>
          `;
        })
        .join('');

      return `
        <div class="calendar-day-cell ${outsideClass} ${todayClass}" data-date="${day.dateStr}">
            <span class="calendar-day-number">${day.dayNumber}</span>
            <div class="calendar-day-events" data-date="${day.dateStr}">
                ${itemsHtml}
            </div>
        </div>
      `;
    })
    .join('');

  return `
    <div class="calendar-view-root">
        <div class="calendar-nav-bar">
            <h2 class="calendar-month-heading">${monthName} ${year}</h2>
            <div class="calendar-nav-controls">
                <button type="button" id="btn-prev-month" class="content-os-btn content-os-btn-sm" aria-label="Mes anterior">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button type="button" id="btn-today-month" class="content-os-btn content-os-btn-sm">Hoy</button>
                <button type="button" id="btn-next-month" class="content-os-btn content-os-btn-sm" aria-label="Mes siguiente">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
            </div>
        </div>

        <div class="calendar-grid">
            ${headerDaysHtml}
            ${cellsHtml}
        </div>
    </div>
  `;
}

export class CalendarView {
  constructor(container, { contentService, filterService, dragDropController, router }) {
    this.container = container;
    this.contentService = contentService;
    this.filterService = filterService;
    this.dragDrop = dragDropController;
    this.router = router;

    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
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
    const days = getCalendarDays(this.currentYear, this.currentMonth);
    const contents = await this.filterService.getFilteredContents();

    const contentsByDate = {};
    for (const c of contents) {
      if (!contentsByDate[c.publish_date]) {
        contentsByDate[c.publish_date] = [];
      }
      contentsByDate[c.publish_date].push(c);
    }

    this.container.innerHTML = renderCalendarHtml({
      year: this.currentYear,
      month: this.currentMonth,
      days,
      contentsByDate,
    });

    this.setupInteractions(contents);
  }

  setupInteractions(contents) {
    // Navigation buttons
    const prevBtn = this.container.querySelector('#btn-prev-month');
    const nextBtn = this.container.querySelector('#btn-next-month');
    const todayBtn = this.container.querySelector('#btn-today-month');

    prevBtn?.addEventListener('click', () => {
      this.currentMonth--;
      if (this.currentMonth < 0) {
        this.currentMonth = 11;
        this.currentYear--;
      }
      this.render();
    });

    nextBtn?.addEventListener('click', () => {
      this.currentMonth++;
      if (this.currentMonth > 11) {
        this.currentMonth = 0;
        this.currentYear++;
      }
      this.render();
    });

    todayBtn?.addEventListener('click', () => {
      const now = new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth();
      this.render();
    });

    // Event clicks to open detail
    const eventItems = this.container.querySelectorAll('.calendar-event-item');
    for (const item of eventItems) {
      const contentId = Number(item.dataset.contentId);
      const content = contents.find((c) => c.id === contentId);

      item.addEventListener('click', () => {
        if (!item.classList.contains('is-dragging')) {
          this.router.navigate(`#/content/view/${contentId}`);
        }
      });

      if (this.dragDrop && content) {
        this.dragDrop.makeDraggable(item, {
          data: {
            type: 'calendar-event',
            contentId: content.id,
            originalDate: content.publish_date,
          },
        });
      }
    }

    // Day cell drop zones for rescheduling (AC-14)
    const dayCells = this.container.querySelectorAll('.calendar-day-cell');
    for (const cell of dayCells) {
      const targetDate = cell.dataset.date;

      if (this.dragDrop) {
        this.dragDrop.makeDropZone(cell, {
          accepts: ['calendar-event', 'content-card'],
          onDrop: async (data) => {
            if (data.originalDate !== targetDate) {
              await this.contentService.updateContentDate(data.contentId, targetDate);
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
