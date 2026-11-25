import { getBaseUrl, flattenToAppURL } from '@plone/volto/helpers/Url/Url';

/**
 * Default number of extra levels fetched below `root_path`. `0` keeps the
 * classic behaviour: only the direct children of the root path are shown.
 * @constant {number}
 */
export const DEFAULT_DEPTH = 0;

/**
 * Normalize a path so it can be compared with another one: strip the API/portal
 * prefix, collapse duplicate slashes and drop the trailing slash.
 * @function normalizePath
 * @param {string} path Path to normalize.
 * @returns {string} Normalized, always leading-slash path.
 */
export const normalizePath = (path = '') => {
  const normalized = getBaseUrl(path) || '/';
  const squashed = normalized.replace(/\/{2,}/g, '/');
  const withLeadingSlash = `/${squashed.replace(/^\/+/, '')}`;
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '');
};

/**
 * Read the depth from the block data. Values coming from the sidebar number
 * widget are strings, older blocks have no value at all.
 * @function getDepth
 * @param {Object} data Block data.
 * @returns {number} Depth, at least 0.
 */
export const getDepth = (data = {}) => {
  const depth = Number.parseInt(data?.depth, 10);
  return Number.isNaN(depth) || depth < DEFAULT_DEPTH ? DEFAULT_DEPTH : depth;
};

/**
 * Get the app URL of a navigation item.
 * @function getItemUrl
 * @param {Object} item Navigation item.
 * @returns {string} App relative URL.
 */
export const getItemUrl = (item) =>
  flattenToAppURL(item?.url || item?.['@id'] || '');

/**
 * Flatten the results of an `@search?path=...&path.depth=N` request into a
 * depth-first ordered list, so a parent is always immediately followed by its
 * children. Siblings keep the order they have in the folder.
 * @function flattenDescendants
 * @param {Array} items Flat search results.
 * @param {string} rootPath Path every item has to be below.
 * @returns {Array} Flat, depth-first ordered items.
 */
export const flattenDescendants = (items = [], rootPath = '/') => {
  const root = normalizePath(rootPath);
  const byParent = new Map();

  items.forEach((item) => {
    const itemPath = normalizePath(item?.['@id'] || item?.url || '');
    if (!itemPath || itemPath === root) return;
    if (root !== '/' && !itemPath.startsWith(`${root}/`)) return;

    const parentPath = itemPath.slice(0, itemPath.lastIndexOf('/')) || '/';
    if (!byParent.has(parentPath)) byParent.set(parentPath, []);
    byParent.get(parentPath).push(item);
  });

  byParent.forEach((siblings) => {
    siblings.sort((a, b) => {
      const positionA = a.getObjPositionInParent;
      const positionB = b.getObjPositionInParent;
      if (typeof positionA === 'number' && typeof positionB === 'number') {
        return positionA - positionB;
      }
      return (a.title || '').localeCompare(b.title || '');
    });
  });

  const flat = [];
  const seen = new Set();
  const walk = (parentPath) => {
    (byParent.get(parentPath) || []).forEach((item) => {
      const itemPath = normalizePath(item?.['@id'] || item?.url || '');
      if (seen.has(itemPath)) return;
      seen.add(itemPath);
      flat.push(item);
      walk(itemPath);
    });
  };
  walk(root);

  return flat;
};
