import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DragDropState } from '../../src/static/js/ui/dragDrop.js';

describe('DragDropController & State (AC-11, AC-14, AC-28)', () => {
  test('Initial state is idle', () => {
    const state = new DragDropState();
    assert.equal(state.isDragging, false);
    assert.equal(state.dragData, null);
  });

  test('startDrag stores data and sets dragging flag', () => {
    const state = new DragDropState();
    state.startDrag({ type: 'content-card', contentId: 42, sourceStageId: 1 });

    assert.equal(state.isDragging, true);
    assert.equal(state.dragData.contentId, 42);
    assert.equal(state.dragData.type, 'content-card');
  });

  test('isValidDropTarget validates matching accept types', () => {
    const state = new DragDropState();
    state.startDrag({ type: 'content-card', contentId: 42 });

    assert.equal(state.canDropOn(['content-card']), true);
    assert.equal(state.canDropOn(['calendar-cell']), false);
    assert.equal(state.canDropOn(['content-card', 'calendar-cell']), true);
  });

  test('endDrag resets state back to idle', () => {
    const state = new DragDropState();
    state.startDrag({ type: 'content-card', contentId: 42 });
    assert.equal(state.isDragging, true);

    state.endDrag();
    assert.equal(state.isDragging, false);
    assert.equal(state.dragData, null);
  });
});
