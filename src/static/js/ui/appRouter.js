export function parseRoute(hash) {
  const cleanHash = (hash ?? '').replace(/^#\/?/, '');

  if (!cleanHash || cleanHash === 'kanban') {
    return { view: 'kanban', params: {} };
  }

  if (cleanHash === 'calendar') {
    return { view: 'calendar', params: {} };
  }

  if (cleanHash === 'content/new') {
    return { view: 'content-form', params: { isNew: true } };
  }

  const editMatch = cleanHash.match(/^content\/edit\/(\d+)$/);
  if (editMatch) {
    return { view: 'content-form', params: { id: Number(editMatch[1]), isNew: false } };
  }

  const viewMatch = cleanHash.match(/^content\/view\/(\d+)$/);
  if (viewMatch) {
    return { view: 'content-detail', params: { id: Number(viewMatch[1]) } };
  }

  if (cleanHash === 'settings') {
    return { view: 'settings', params: {} };
  }

  return { view: 'kanban', params: {} };
}

export class AppRouter {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;
  }

  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }

  navigate(hash) {
    if (typeof window === 'undefined') return;
    window.location.hash = hash.startsWith('#') ? hash : `#/${hash.replace(/^\//, '')}`;
  }

  handleRoute() {
    const hash = window.location.hash;
    const parsed = parseRoute(hash);
    this.currentRoute = parsed;

    // Update nav active classes
    const navLinks = document.querySelectorAll('.content-os-nav-link');
    for (const link of navLinks) {
      const linkHash = link.getAttribute('href');
      const isActive =
        (parsed.view === 'kanban' && linkHash === '#/kanban') ||
        (parsed.view === 'calendar' && linkHash === '#/calendar') ||
        (parsed.view === 'content-form' && parsed.params.isNew && linkHash === '#/content/new') ||
        (parsed.view === 'settings' && linkHash === '#/settings');

      if (isActive) {
        link.classList.add('is-active');
      } else {
        link.classList.remove('is-active');
      }
    }

    // Call route handler if registered
    const handler = this.routes[parsed.view];
    if (typeof handler === 'function') {
      handler(parsed.params);
    }
  }
}
