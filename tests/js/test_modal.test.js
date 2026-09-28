import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createModalHtml } from '../../src/static/js/ui/modal.js';

describe('Modal Component - Markup & Structure (AC-17, AC-18, AC-19, AC-27, AC-29)', () => {
  test('Generates modal HTML with title, message, and action buttons', () => {
    const html = createModalHtml({
      title: '¿Eliminar contenido?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      isDanger: true,
    });

    assert.match(html, /class="modal-backdrop/);
    assert.match(html, /class="modal-dialog/);
    assert.match(html, /¿Eliminar contenido\?/);
    assert.match(html, /Esta acción no se puede deshacer\./);
    assert.match(html, /id="modal-confirm"/);
    assert.match(html, /id="modal-cancel"/);
    assert.match(html, /content-os-btn-danger/);
  });

  test('Generates alert modal HTML with only confirmation button', () => {
    const html = createModalHtml({
      title: 'Aviso',
      message: 'Operación completada con éxito.',
      confirmText: 'Aceptar',
      showCancel: false,
    });

    assert.match(html, /Aviso/);
    assert.match(html, /Operación completada con éxito\./);
    assert.match(html, /id="modal-confirm"/);
    assert.doesNotMatch(html, /id="modal-cancel"/);
  });
});
