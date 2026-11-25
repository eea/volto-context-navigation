import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
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
