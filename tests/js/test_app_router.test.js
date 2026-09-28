import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute } from '../../src/static/js/ui/appRouter.js';

describe('AppRouter - Route Resolution (AC-28, AC-29)', () => {
  test('Resolves #/kanban and empty hash to kanban view', () => {
    assert.deepEqual(parseRoute(''), { view: 'kanban', params: {} });
    assert.deepEqual(parseRoute('#'), { view: 'kanban', params: {} });
    assert.deepEqual(parseRoute('#/kanban'), { view: 'kanban', params: {} });
  });

  test('Resolves #/calendar to calendar view', () => {
    assert.deepEqual(parseRoute('#/calendar'), { view: 'calendar', params: {} });
  });

  test('Resolves #/content/new to content-form creation view', () => {
    assert.deepEqual(parseRoute('#/content/new'), {
      view: 'content-form',
      params: { isNew: true },
    });
  });

  test('Resolves #/content/edit/15 to content-form edit view with ID', () => {
    assert.deepEqual(parseRoute('#/content/edit/15'), {
      view: 'content-form',
      params: { id: 15, isNew: false },
    });
  });

  test('Resolves #/content/view/28 to content-detail view with ID', () => {
    assert.deepEqual(parseRoute('#/content/view/28'), {
      view: 'content-detail',
      params: { id: 28 },
    });
  });

  test('Resolves #/settings to settings view', () => {
    assert.deepEqual(parseRoute('#/settings'), { view: 'settings', params: {} });
  });
});
