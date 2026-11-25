import config from '@plone/volto/registry';

import {
  DEFAULT_DEPTH,
  flattenDescendants,
  getDepth,
  normalizePath,
} from './helpers';

// The Volto registry is normally populated by the project test setup; make the
// suite self-contained so `getBaseUrl` has the settings it needs.
config.set('settings', {
  ...config.settings,
  nonContentRoutes: config.settings?.nonContentRoutes || [],
});

describe('normalizePath', () => {
  it('collapses duplicate and trailing slashes', () => {
    expect(normalizePath('/en//foo/')).toBe('/en/foo');
    expect(normalizePath('/')).toBe('/');
  });
});

describe('getDepth', () => {
  it('defaults to 0 so only the children of the root path are shown', () => {
    expect(DEFAULT_DEPTH).toBe(0);
    expect(getDepth({})).toBe(0);
    expect(getDepth()).toBe(0);
  });

  it('accepts the string values coming from the sidebar number widget', () => {
    expect(getDepth({ depth: '2' })).toBe(2);
  });

  it('ignores invalid and negative values', () => {
    expect(getDepth({ depth: '' })).toBe(0);
    expect(getDepth({ depth: null })).toBe(0);
    expect(getDepth({ depth: 'abc' })).toBe(0);
    expect(getDepth({ depth: -3 })).toBe(0);
  });
});

describe('flattenDescendants', () => {
  const items = [
    {
      id: 'dogs',
      title: 'Dogs',
      '@id': '/root/mammals/dogs',
      getObjPositionInParent: 1,
    },
    {
      id: 'birds',
      title: 'Birds',
      '@id': '/root/birds',
      getObjPositionInParent: 2,
    },
    {
      id: 'mammals',
      title: 'Mammals',
      '@id': '/root/mammals',
      getObjPositionInParent: 1,
    },
    {
      id: 'cats',
      title: 'Cats',
      '@id': '/root/mammals/cats',
      getObjPositionInParent: 2,
    },
  ];

  it('puts every parent before its own children and keeps folder order', () => {
    expect(flattenDescendants(items, '/root').map((item) => item.id)).toEqual([
      'mammals',
      'dogs',
      'cats',
      'birds',
    ]);
  });

  it('drops the root path and anything outside of it', () => {
    expect(
      flattenDescendants(
        [
          { id: 'root', '@id': '/root' },
          { id: 'other', '@id': '/other/page' },
          ...items,
        ],
        '/root',
      ).map((item) => item.id),
    ).toEqual(['mammals', 'dogs', 'cats', 'birds']);
  });

  it('falls back to the title when there is no position metadata', () => {
    expect(
      flattenDescendants(
        [
          { id: 'b', title: 'b', '@id': '/root/b' },
          { id: 'a', title: 'a', '@id': '/root/a' },
        ],
        '/root',
      ).map((item) => item.id),
    ).toEqual(['a', 'b']);
  });
});
