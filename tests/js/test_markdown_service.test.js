import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MarkdownService } from '../../src/static/js/services/markdownService.js';

describe('MarkdownService - Formatting & Sanitization (AC-7, AC-15)', () => {
  test('Renders headings correctly', () => {
    const md = '# Main Title\n## Subtitle\n### Section';
    const html = MarkdownService.render(md);
    assert.match(html, /<h1>Main Title<\/h1>/);
    assert.match(html, /<h2>Subtitle<\/h2>/);
    assert.match(html, /<h3>Section<\/h3>/);
  });

  test('Renders bold and italic text', () => {
    const md = 'This is **bold text** and this is *italic text*.';
    const html = MarkdownService.render(md);
    assert.match(html, /<strong>bold text<\/strong>/);
    assert.match(html, /<em>italic text<\/em>/);
  });

  test('Renders unordered lists', () => {
    const md = '- Point one\n- Point two\n- Point three';
    const html = MarkdownService.render(md);
    assert.match(html, /<ul>/);
    assert.match(html, /<li>Point one<\/li>/);
    assert.match(html, /<li>Point two<\/li>/);
    assert.match(html, /<li>Point three<\/li>/);
  });

  test('Renders blockquotes and inline code', () => {
    const md = '> Important note\nHere is `const x = 10;` in code.';
    const html = MarkdownService.render(md);
    assert.match(html, /<blockquote>Important note<\/blockquote>/);
    assert.match(html, /<code>const x = 10;<\/code>/);
  });

  test('Sanitizes malicious script tags and HTML injection', () => {
    const malicious = '<script>alert("hack")</script><img src="x" onerror="evil()">';
    const html = MarkdownService.render(malicious);
    assert.doesNotMatch(html, /<script>/);
    assert.doesNotMatch(html, /onerror=/);
  });

  test('Formats empty string safely', () => {
    assert.equal(MarkdownService.render(''), '');
    assert.equal(MarkdownService.render(null), '');
  });

  test('Helper: applyFormat wraps or inserts markdown syntax at cursor position', () => {
    const original = 'Hello world';
    // Wrap "world" in bold (indices 6 to 11)
    const result = MarkdownService.applyFormat(original, 6, 11, '**', '**');
    assert.equal(result.text, 'Hello **world**');
    assert.equal(result.newSelectionStart, 8);
    assert.equal(result.newSelectionEnd, 13);
  });
});
