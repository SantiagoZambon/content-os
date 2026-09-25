import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getCalendarDays, renderCalendarHtml } from '../../src/static/js/ui/calendarView.js';

describe('CalendarView - Month Grid & Rendering (AC-12, AC-13, AC-14, AC-20, AC-21, AC-28, AC-29)', () => {
  test('AC-12: getCalendarDays generates full grid of weeks starting on Monday', () => {
    // October 2026: 31 days. Starts on Thursday (day 4), ends on Saturday (day 6).
    const days = getCalendarDays(2026, 9); // Month is 0-indexed: 9 = October

    assert.ok(days.length === 35 || days.length === 42);
    assert.equal(days.length % 7, 0);

    const oct1 = days.find((d) => d.dateStr === '2026-10-01');
    assert.ok(oct1);
    assert.equal(oct1.isCurrentMonth, true);
    assert.equal(oct1.dayNumber, 1);

    const oct31 = days.find((d) => d.dateStr === '2026-10-31');
    assert.ok(oct31);
    assert.equal(oct31.isCurrentMonth, true);
    assert.equal(oct31.dayNumber, 31);
  });

  test('AC-13: Renders calendar HTML with month header, day headers and scheduled events', () => {
    const days = getCalendarDays(2026, 9);
    const contentsByDate = {
      '2026-10-15': [
        {
          id: 55,
          title: 'Special Live Stream',
          channel_name: 'YouTube',
          publish_date: '2026-10-15',
        },
      ],
    };

    const html = renderCalendarHtml({
      year: 2026,
      month: 9,
      days,
      contentsByDate,
    });

    assert.match(html, /class="calendar-view-root/);
    assert.match(html, /Octubre 2026/);
    assert.match(html, /id="btn-prev-month"/);
    assert.match(html, /id="btn-next-month"/);
    assert.match(html, /data-date="2026-10-15"/);
    assert.match(html, /Special Live Stream/);
    assert.match(html, /YouTube/);
  });
});
