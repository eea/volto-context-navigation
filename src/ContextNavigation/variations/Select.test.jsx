import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-intl-redux';
import configureStore from 'redux-mock-store';
import Select from './Select';

const mockStore = configureStore();
const store = mockStore({
  intl: {
    locale: 'en',
    messages: {},
  },
});

const items = [
  {
    id: 'mammals',
    title: 'D1 · Mammals',
    '@id': '/en/mammals',
    '@type': 'Folder',
  },
  { id: 'birds', title: 'D2 · Birds', '@id': '/en/birds', '@type': 'Folder' },
  { id: 'fish', title: 'D3 · Fish', '@id': '/en/fish', '@type': 'Document' },
];

const renderWithProviders = (ui, { path = '/en/birds' } = {}) =>
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </Provider>,
  );

describe('Select variation', () => {
  it('shows the current page in the trigger', () => {
    const { getByRole } = renderWithProviders(
      <Select items={items} data={{}} />,
    );

    expect(getByRole('button')).toHaveTextContent('D2 · Birds');
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens the dropdown with the siblings and navigates on selection', () => {
    const { getByRole } = renderWithProviders(
      <Select items={items} data={{}} />,
    );

    fireEvent.click(getByRole('button'));
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'true');

    const menu = within(getByRole('menu'));
    expect(menu.getByText('D1 · Mammals')).toHaveAttribute(
      'href',
      '/en/mammals',
    );
    expect(menu.getByText('D2 · Birds')).toHaveAttribute(
      'aria-current',
      'page',
    );

    fireEvent.click(menu.getByText('D1 · Mammals'));
    expect(getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  });

  it('only lists the configured content types', () => {
    const { getByRole } = renderWithProviders(
      <Select items={items} data={{ types: ['Folder'] }} />,
    );

    fireEvent.click(getByRole('button'));
    const menu = within(getByRole('menu'));
    expect(menu.getByText('D1 · Mammals')).toBeInTheDocument();
    expect(menu.queryByText('D3 · Fish')).not.toBeInTheDocument();
  });

  it('closes on Escape', () => {
    const { getByRole, queryByRole } = renderWithProviders(
      <Select items={items} data={{}} />,
    );

    fireEvent.click(getByRole('button'));
    expect(queryByRole('menu')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(queryByRole('menu')).not.toBeInTheDocument();
  });
});
