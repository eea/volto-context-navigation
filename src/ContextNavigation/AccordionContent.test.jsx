import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-intl-redux';
import AccordionContent from './AccordionContent';

const mockStore = configureStore();

jest.mock('./View', () => ({
  useChildren: jest.fn(() => [
    {
      id: 'item-1',
      title: 'Item 1',
      '@id': '/item-1',
      '@type': 'Folder',
    },
  ]),
}));

describe('AccordionContent', () => {
  it('should render the component', () => {
    const props = {
      main: {
        url: '/test-location',
      },
      curent_location: {
        pathname: '/item-1',
      },
      data: {
        types: ['Folder'],
      },
    };

    const store = mockStore({
      userSession: { token: '1234' },
      intl: {
        locale: 'en',
        messages: {},
      },
      content: {
        subrequests: {},
      },
    });

    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <AccordionContent {...props} />
        </MemoryRouter>
      </Provider>,
    );
    expect(container.querySelector('.dataset-content')).toBeInTheDocument();
  });
});
