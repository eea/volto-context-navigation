import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import config from '@plone/volto/registry';

import View from './View';
import variations from './variations';

const mockStore = configureStore();

const items = [
  {
    id: 'mammals',
    title: 'D1 · Mammals',
    '@id': '/mammals',
    '@type': 'Folder',
  },
];

const store = mockStore({
  intl: { locale: 'en', messages: {} },
  content: {
    subrequests: {
      '/root': { data: { items } },
    },
  },
});

const renderView = (data) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/mammals']}>
        <View
          data={{ '@type': 'contextNavigation', root_path: '/root', ...data }}
        />
      </MemoryRouter>
    </Provider>,
  );

describe('ContextNavigation View', () => {
  beforeAll(() => {
    // Make the test suite self-contained: the registry is normally populated
    // by the Volto test setup, which is not always available.
    config.set('settings', {
      ...config.settings,
      nonContentRoutes: config.settings?.nonContentRoutes || [],
    });
    const blocksConfig = config.blocks?.blocksConfig || {};
    config.set('blocks', {
      ...config.blocks,
      blocksConfig: {
        ...blocksConfig,
        contextNavigation: { ...blocksConfig.contextNavigation, variations },
      },
    });
  });

  it('falls back to the Accordion variation for blocks without a variation', () => {
    const { container } = renderView({});

    expect(container.querySelector('.variation-accordion')).toBeInTheDocument();
  });

  it('renders the Select variation when it is selected', () => {
    const { container, getByRole } = renderView({ variation: 'select' });

    expect(container.querySelector('.variation-select')).toBeInTheDocument();
    expect(getByRole('button')).toHaveTextContent('D1 · Mammals');
  });

  it('keeps the block visible with a placeholder when there are no items', () => {
    const { container, getByText } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/mammals']}>
          <View data={{ '@type': 'contextNavigation', root_path: '/empty' }} />
        </MemoryRouter>
      </Provider>,
    );

    expect(
      container.querySelector('.block.context-navigation-block'),
    ).toBeInTheDocument();
    expect(getByText('No items available')).toBeInTheDocument();
  });

  it('renders the placeholder for the Select variation when the types filter empties it', () => {
    const { getByText } = renderView({
      variation: 'select',
      types: ['Document'],
    });

    expect(getByText('No items available')).toBeInTheDocument();
  });
});

describe('ContextNavigation View depth', () => {
  const depthItems = [
    {
      id: 'mammals',
      title: 'Mammals',
      '@id': '/root/mammals',
      '@type': 'Folder',
      getObjPositionInParent: 1,
    },
    {
      id: 'dogs',
      title: 'Dogs',
      '@id': '/root/mammals/dogs',
      '@type': 'Document',
      getObjPositionInParent: 1,
    },
    {
      id: 'birds',
      title: 'Birds',
      '@id': '/root/birds',
      '@type': 'Folder',
      getObjPositionInParent: 2,
    },
  ];

  const renderDepthView = (depth, variation = 'select', path = '/root') => {
    const store = mockStore({
      intl: { locale: 'en', messages: {} },
      content: { subrequests: {} },
      search: {
        subrequests: {
          [`/root::depth=${depth ?? 0}`]: { items: depthItems, total: 3 },
        },
      },
    });
    const utils = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[path]}>
          <View
            data={{
              '@type': 'contextNavigation',
              root_path: '/root',
              depth,
              variation,
            }}
          />
        </MemoryRouter>
      </Provider>,
    );
    return { ...utils, store };
  };

  it('requests the extra levels of children with @search', () => {
    const { store } = renderDepthView(2);
    const searchAction = store
      .getActions()
      .find((action) => action.type === 'SEARCH_CONTENT');

    expect(searchAction.request.path).toContain('path.depth=3');
    expect(searchAction.request.path).toContain('path=/root');
    expect(searchAction.subrequest).toBe('/root::depth=2');
  });

  it('only requests the direct children when no depth is set', () => {
    const { store } = renderDepthView(undefined);
    const actions = store.getActions();

    expect(actions.some((action) => action.type === 'SEARCH_CONTENT')).toBe(
      false,
    );
    expect(actions.some((action) => action.type === 'GET_CONTENT')).toBe(true);
  });

  it('lists every level as a flat list in the Select variation', () => {
    const { getByRole, getAllByRole, getByText } = renderDepthView(
      1,
      'select',
      '/root/mammals/dogs',
    );
    fireEvent.click(getByRole('button'));

    // The grandchild is part of the list and is the current page.
    expect(getByRole('button')).toHaveTextContent('Dogs');
    expect(getAllByRole('menuitem')).toHaveLength(3);
    expect(getByText('Mammals')).toBeInTheDocument();
    expect(getByText('Birds')).toBeInTheDocument();
  });

  it('does not expand items in the Accordion variation when depth is used', () => {
    const { container } = renderDepthView(1, 'accordion');

    expect(container.querySelectorAll('.ri-arrow-down-s-line')).toHaveLength(0);
    expect(container.querySelectorAll('.ri-arrow-up-s-line')).toHaveLength(0);
  });
});
