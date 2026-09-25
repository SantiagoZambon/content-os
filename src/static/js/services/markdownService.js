export class MarkdownService {
  static escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/on\w+\s*=/gi, 'data-blocked=');
  }

  static render(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return '';
    }

    const escaped = this.escapeHtml(markdown.trim());
    const lines = escaped.split(/\r?\n/);
    const htmlBlocks = [];
    let inList = false;
    let listItems = [];

    const flushList = () => {
      if (inList) {
        htmlBlocks.push(`<ul>${listItems.map((li) => `<li>${li}</li>`).join('')}</ul>`);
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) {
        flushList();
        continue;
      }

      // List items (- or *)
      if (/^[-*]\s+(.+)/.test(line)) {
        inList = true;
        const itemContent = line.replace(/^[-*]\s+/, '');
        listItems.push(this.renderInline(itemContent));
        continue;
      } else {
        flushList();
      }

      // Headings
      if (/^###\s+(.+)/.test(line)) {
        htmlBlocks.push(`<h3>${this.renderInline(line.replace(/^###\s+/, ''))}</h3>`);
        continue;
      }
      if (/^##\s+(.+)/.test(line)) {
        htmlBlocks.push(`<h2>${this.renderInline(line.replace(/^##\s+/, ''))}</h2>`);
        continue;
      }
      if (/^#\s+(.+)/.test(line)) {
        htmlBlocks.push(`<h1>${this.renderInline(line.replace(/^#\s+/, ''))}</h1>`);
        continue;
      }

      // Blockquotes
      if (/^&gt;\s+(.+)/.test(line)) {
        htmlBlocks.push(`<blockquote>${this.renderInline(line.replace(/^&gt;\s+/, ''))}</blockquote>`);
        continue;
      }

      // Normal paragraph
      htmlBlocks.push(`<p>${this.renderInline(line)}</p>`);
    }

    flushList();

    return htmlBlocks.join('\n');
  }

  static renderInline(text) {
    if (!text) return '';

    return text
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
  }

  static applyFormat(text, start, end, prefix, suffix = prefix) {
    const safeText = text ?? '';
    const safeStart = Math.max(0, start ?? 0);
    const safeEnd = Math.max(safeStart, end ?? safeStart);

    const before = safeText.substring(0, safeStart);
    const selection = safeText.substring(safeStart, safeEnd);
    const after = safeText.substring(safeEnd);

    const replacement = `${prefix}${selection}${suffix}`;
    const newText = before + replacement + after;

    return {
      text: newText,
      newSelectionStart: safeStart + prefix.length,
      newSelectionEnd: safeStart + prefix.length + selection.length,
    };
  }
}
