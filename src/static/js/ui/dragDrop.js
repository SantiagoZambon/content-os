export class DragDropState {
  constructor() {
    this.isDragging = false;
    this.dragData = null;
  }

  startDrag(data) {
    this.isDragging = true;
    this.dragData = data;
  }

  canDropOn(acceptedTypes) {
    if (!this.isDragging || !this.dragData) return false;
    if (!Array.isArray(acceptedTypes)) return true;
    return acceptedTypes.includes(this.dragData.type);
  }

  endDrag() {
    this.isDragging = false;
    this.dragData = null;
  }
}

export class DragDropController {
  constructor() {
    this.state = new DragDropState();
    this.activeTouchGhost = null;
    this.activeTouchTarget = null;
  }

  makeDraggable(element, { data, onDragStart, onDragEnd }) {
    if (!element) return;

    element.setAttribute('draggable', 'true');

    // Desktop HTML5 drag
    element.addEventListener('dragstart', (e) => {
      this.state.startDrag(data);
      element.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', JSON.stringify(data));
      }
      if (typeof onDragStart === 'function') {
        onDragStart(data);
      }
    });

    element.addEventListener('dragend', () => {
      element.classList.remove('is-dragging');
      this.state.endDrag();
      if (typeof onDragEnd === 'function') {
        onDragEnd(data);
      }
    });

    // Touch support for mobile devices
    let touchTimeout = null;
    let initialTouch = null;

    element.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        initialTouch = { x: touch.clientX, y: touch.clientY };

        touchTimeout = setTimeout(() => {
          this.state.startDrag(data);
          element.classList.add('is-dragging');

          // Create floating ghost
          const rect = element.getBoundingClientRect();
          const ghost = element.cloneNode(true);
          ghost.style.position = 'fixed';
          ghost.style.width = `${rect.width}px`;
          ghost.style.left = `${touch.clientX - rect.width / 2}px`;
          ghost.style.top = `${touch.clientY - 30}px`;
          ghost.style.opacity = '0.85';
          ghost.style.pointerEvents = 'none';
          ghost.style.zIndex = '9999';
          ghost.style.transform = 'scale(1.03)';
          ghost.style.boxShadow = '0 12px 32px rgba(0,0,0,0.6)';

          document.body.appendChild(ghost);
          this.activeTouchGhost = ghost;

          if (typeof onDragStart === 'function') {
            onDragStart(data);
          }
        }, 200);
      },
      { passive: true }
    );

    element.addEventListener(
      'touchmove',
      (e) => {
        const touch = e.touches[0];
        if (!this.state.isDragging) {
          if (initialTouch) {
            const dist = Math.hypot(touch.clientX - initialTouch.x, touch.clientY - initialTouch.y);
            if (dist > 10) {
              clearTimeout(touchTimeout);
            }
          }
          return;
        }

        e.preventDefault();
        if (this.activeTouchGhost) {
          const rect = element.getBoundingClientRect();
          this.activeTouchGhost.style.left = `${touch.clientX - rect.width / 2}px`;
          this.activeTouchGhost.style.top = `${touch.clientY - 30}px`;
        }

        // Highlight drop zone under finger
        const elemBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = elemBelow?.closest('[data-drop-zone]');

        if (dropZone !== this.activeTouchTarget) {
          if (this.activeTouchTarget) {
            this.activeTouchTarget.classList.remove('is-drag-over');
          }
          if (dropZone && this.state.canDropOn(JSON.parse(dropZone.dataset.accepts || '[]'))) {
            dropZone.classList.add('is-drag-over');
            this.activeTouchTarget = dropZone;
          } else {
            this.activeTouchTarget = null;
          }
        }
      },
      { passive: false }
    );

    const finishTouch = () => {
      clearTimeout(touchTimeout);
      if (this.activeTouchGhost) {
        this.activeTouchGhost.remove();
        this.activeTouchGhost = null;
      }

      element.classList.remove('is-dragging');

      if (this.activeTouchTarget) {
        this.activeTouchTarget.classList.remove('is-drag-over');
        const dropHandler = this.activeTouchTarget._onDropHandler;
        if (typeof dropHandler === 'function' && this.state.dragData) {
          dropHandler(this.state.dragData);
        }
        this.activeTouchTarget = null;
      }

      if (this.state.isDragging) {
        this.state.endDrag();
        if (typeof onDragEnd === 'function') {
          onDragEnd(data);
        }
      }
    };

    element.addEventListener('touchend', finishTouch);
    element.addEventListener('touchcancel', finishTouch);
  }

  makeDropZone(element, { accepts = [], onDrop, onDragEnter, onDragLeave }) {
    if (!element) return;

    element.setAttribute('data-drop-zone', 'true');
    element.setAttribute('data-accepts', JSON.stringify(accepts));
    element._onDropHandler = onDrop;

    element.addEventListener('dragover', (e) => {
      if (this.state.canDropOn(accepts)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        element.classList.add('is-drag-over');
        if (typeof onDragEnter === 'function') onDragEnter();
      }
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('is-drag-over');
      if (typeof onDragLeave === 'function') onDragLeave();
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      element.classList.remove('is-drag-over');

      let payload = this.state.dragData;
      if (!payload && e.dataTransfer) {
        try {
          payload = JSON.parse(e.dataTransfer.getData('text/plain'));
        } catch {
          payload = null;
        }
      }

      if (payload && this.state.canDropOn(accepts)) {
        if (typeof onDrop === 'function') {
          onDrop(payload);
        }
      }
    });
  }
}
