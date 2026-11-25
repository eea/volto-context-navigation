import React from 'react';
import { compose } from 'redux';
import Accordion from './Accordion';
import EmptyState from './EmptyState';
import { getItemUrl, normalizePath } from './helpers';
import { useLocation } from 'react-router-dom';

/**
 * A navigation slot implementation, similar to the classic Plone navigation
 * portlet. It uses the same API, so the options are similar to
 * INavigationPortlet
 */
export function ContextNavigationComponent(props) {
  const { items = [], data } = props;
  let activeMenu = null;

  const curent_location = useLocation();
  const currentPath = normalizePath(curent_location?.pathname);

  for (let i = 0; i < items.length; i++) {
    const itemUrl = normalizePath(getItemUrl(items[i]));
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

  if (!items.length) {
    return <EmptyState title={data?.title} />;
  }

  return (
    <>
      <Accordion
        items={items}
        curent_location={curent_location}
        activeMenu={activeMenu}
        data={data}
      />
    </>
  );
}

// withContentNavigation
export default compose()(ContextNavigationComponent);
