import {marked} from 'marked';
import {NOTE_TAGS} from '~/lib/note-tags';

const noteModules = import.meta.glob('../../content/notes/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

const NOTE_TAG_ALIASES = new Map(NOTE_TAGS.map((tag) => [tag.toLowerCase(), tag]));

/**
 * @typedef {Object} NoteMeta
 * @property {string} title
 * @property {string} date
 * @property {string} slug
 * @property {string} category
 * @property {string} coverImage
 * @property {string} excerpt
 * @property {string[]} tags
 */

/**
 * @typedef {NoteMeta & {content: string}} Note
 */

/**
 * @returns {Note[]}
 */
function loadAllNotes() {
  return Object.values(noteModules)
    .map((raw) => {
      const {data, content} = parseFrontmatter(String(raw));

      return {
        title: String(data.title || ''),
        date: String(data.date || ''),
        slug: String(data.slug || ''),
        category: String(data.category || 'Notes'),
        coverImage: String(data.coverImage || ''),
        excerpt: String(data.excerpt || ''),
        tags: normalizeTags(data.tags),
        content,
      };
    })
    .filter((note) => Boolean(note.slug && note.title))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Parses YAML-like frontmatter without Node-specific APIs.
 * Supports simple key: value pairs used by note files.
 * @param {string} source
 * @returns {{data: Record<string, string | string[]>, content: string}}
 */
function parseFrontmatter(source) {
  const normalized = source.replace(/\r\n/g, '\n');

  if (!normalized.startsWith('---\n')) {
    return {data: {}, content: normalized.trim()};
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    return {data: {}, content: normalized.trim()};
  }

  const rawData = normalized.slice(4, end);
  const content = normalized.slice(end + 5).trim();
  /** @type {Record<string, string | string[]>} */
  const data = {};
  let listKey = '';

  for (const line of rawData.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Supports YAML list continuation for keys like:
    // tags:
    //   - Brewing
    //   - Beginner
    if (listKey && trimmed.startsWith('- ')) {
      const item = stripWrappingQuotes(trimmed.slice(2).trim());
      if (!item) continue;
      const existing = data[listKey];
      if (Array.isArray(existing)) {
        existing.push(item);
      } else {
        data[listKey] = [item];
      }
      continue;
    }

    if (!trimmed.includes(':')) {
      listKey = '';
      continue;
    }

    const separator = trimmed.indexOf(':');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (!value) {
      data[key] = [];
      listKey = key;
      continue;
    }

    listKey = '';

    // Supports inline array syntax, e.g. tags: [Brewing, Beginner]
    if (value.startsWith('[') && value.endsWith(']')) {
      const items = value
        .slice(1, -1)
        .split(',')
        .map((item) => stripWrappingQuotes(item.trim()))
        .filter(Boolean);
      data[key] = items;
      continue;
    }

    data[key] = stripWrappingQuotes(value);
  }

  return {data, content};
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
function normalizeTags(value) {
  const rawTags = Array.isArray(value)
    ? value.map((item) => String(item).trim())
    : typeof value === 'string'
      ? value.split(',').map((item) => item.trim())
      : [];

  const canonicalTags = rawTags
    .map((tag) => NOTE_TAG_ALIASES.get(tag.toLowerCase()) || '')
    .filter(Boolean);

  return [...new Set(canonicalTags)];
}

/**
 * @param {string} value
 * @returns {string}
 */
function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

/**
 * @returns {NoteMeta[]}
 */
export function getAllNotesMeta() {
  return loadAllNotes().map(({content, ...meta}) => meta);
}

/**
 * @param {string} slug
 * @returns {Note | null}
 */
export function getNoteBySlug(slug) {
  return loadAllNotes().find((note) => note.slug === slug) || null;
}

/**
 * @param {string} markdown
 * @returns {string}
 */
export function renderMarkdown(markdown) {
  return marked.parse(markdown, {async: false});
}
