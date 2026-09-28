import { MarkdownService } from '../services/markdownService.js';

export function createModalHtml({
  title = 'Confirmación',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
  showCancel = true,
}) {
  const safeTitle = MarkdownService.escapeHtml(title);
  const safeMessage = MarkdownService.escapeHtml(message);
  const confirmClass = isDanger ? 'content-os-btn content-os-btn-danger' : 'content-os-btn content-os-btn-primary';

  return `
    <div class="modal-backdrop is-open" id="app-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-dialog">
            <h3 class="modal-title" id="modal-title">${safeTitle}</h3>
            <p class="modal-message">${safeMessage}</p>
            <div class="modal-actions">
                ${showCancel ? `<button type="button" class="content-os-btn" id="modal-cancel">${MarkdownService.escapeHtml(cancelText)}</button>` : ''}
                <button type="button" class="${confirmClass}" id="modal-confirm">${MarkdownService.escapeHtml(confirmText)}</button>
            </div>
        </div>
    </div>
  `;
}

export function confirmModal({
  title = 'Confirmación',
  message = '¿Estás seguro de continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDanger = false,
}) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(true);
      return;
    }

    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }

    root.innerHTML = createModalHtml({
      title,
      message,
      confirmText,
      cancelText,
      isDanger,
      showCancel: true,
    });

    const backdrop = document.getElementById('app-modal-backdrop');
    const confirmBtn = document.getElementById('modal-confirm');
    const cancelBtn = document.getElementById('modal-cancel');

    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      root.innerHTML = '';
    };

    const handleConfirm = () => {
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      cleanup();
      resolve(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    confirmBtn?.addEventListener('click', handleConfirm);
    cancelBtn?.addEventListener('click', handleCancel);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        handleCancel();
      }
    });

    document.addEventListener('keydown', handleKeyDown);
  });
}

export function alertModal({
  title = 'Aviso',
  message = '',
  confirmText = 'Aceptar',
}) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve();
      return;
    }

    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }

    root.innerHTML = createModalHtml({
      title,
      message,
      confirmText,
      showCancel: false,
    });

    const backdrop = document.getElementById('app-modal-backdrop');
    const confirmBtn = document.getElementById('modal-confirm');

    const cleanup = () => {
      document.removeEventListener('keydown', handleKeyDown);
      root.innerHTML = '';
    };

    const handleConfirm = () => {
      cleanup();
      resolve();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        handleConfirm();
      }
    };

    confirmBtn?.addEventListener('click', handleConfirm);
    backdrop?.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        handleConfirm();
      }
    });

    document.addEventListener('keydown', handleKeyDown);
  });
}
