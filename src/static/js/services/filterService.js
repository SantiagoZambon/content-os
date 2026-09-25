export class FilterService {
  constructor(contentService) {
    this.contentService = contentService;
    this.filters = {
      channel_id: null,
      stage_id: null,
      content_type_id: null,
      start_date: null,
      end_date: null,
      search_query: null,
    };
    this.listeners = [];
  }

  setFilter(key, value) {
    if (Object.prototype.hasOwnProperty.call(this.filters, key)) {
      this.filters[key] = value !== '' && value !== undefined ? value : null;
      this.notifyListeners();
    }
  }

  getFilters() {
    return { ...this.filters };
  }

  resetFilters() {
    this.filters = {
      channel_id: null,
      stage_id: null,
      content_type_id: null,
      start_date: null,
      end_date: null,
      search_query: null,
    };
    this.notifyListeners();
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.getFilters());
      } catch (err) {
        console.error('Filter listener error:', err);
      }
    }
  }

  apply(contents) {
    if (!Array.isArray(contents)) return [];

    return contents.filter((content) => {
      if (this.filters.channel_id !== null && Number(content.channel_id) !== Number(this.filters.channel_id)) {
        return false;
      }

      if (this.filters.stage_id !== null && Number(content.stage_id) !== Number(this.filters.stage_id)) {
        return false;
      }

      if (
        this.filters.content_type_id !== null &&
        Number(content.content_type_id) !== Number(this.filters.content_type_id)
      ) {
        return false;
      }

      if (this.filters.start_date !== null && content.publish_date < this.filters.start_date) {
        return false;
      }

      if (this.filters.end_date !== null && content.publish_date > this.filters.end_date) {
        return false;
      }

      if (this.filters.search_query !== null && this.filters.search_query.trim() !== '') {
        const query = this.filters.search_query.toLowerCase();
        const titleMatch = (content.title ?? '').toLowerCase().includes(query);
        const scriptMatch = (content.script ?? '').toLowerCase().includes(query);
        if (!titleMatch && !scriptMatch) {
          return false;
        }
      }

      return true;
    });
  }

  async getFilteredContents() {
    const allContents = await this.contentService.getAllContents();
    return this.apply(allContents);
  }
}
