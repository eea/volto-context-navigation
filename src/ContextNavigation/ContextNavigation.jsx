import React from 'react';
import { compose } from 'redux';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers';

import Accordion from './Accordion';
import { useLocation } from 'react-router-dom';

/**
 * A navigation slot implementation, similar to the classic Plone navigation
 * portlet. It uses the same API, so the options are similar to
 * INavigationPortlet
 */
export function ContextNavigationComponent(props) {
  const { items = [], data } = props;
  let activeMenu = null;

  const normalizePath = (path = '') => {
    const normalized = getBaseUrl(path) || '/';
    const squashed = normalized.replace(/\/{2,}/g, '/');
    const withLeadingSlash = `/${squashed.replace(/^\/+/, '')}`;
    return withLeadingSlash === '/'
      ? '/'
      : withLeadingSlash.replace(/\/+$/, '');
  };

  const curent_location = useLocation();
  const currentPath = normalizePath(curent_location?.pathname);

  for (let i = 0; i < items.length; i++) {
    const rawItemPath = items[i]?.url || items[i]?.['@id'] || '';
    const itemUrl = normalizePath(flattenToAppURL(rawItemPath));
    items[i].is_active = false;

    const isActive =
      itemUrl === '/'
        ? currentPath === '/'
        : currentPath === itemUrl || currentPath.startsWith(`${itemUrl}/`);

    if (isActive) {
      activeMenu = i;
      items[i].is_active = true;
    }
  }

  return (
    <>
      {items.length ? (
        <Accordion
          items={items}
          curent_location={curent_location}
          activeMenu={activeMenu}
          data={data}
        />
      ) : null}
    </>
  );
}

// withContentNavigation
export default compose()(ContextNavigationComponent);
