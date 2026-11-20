import React from 'react';
import './styles.less';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions/content/content';
import { resolveBlockExtensions } from '@plone/volto/helpers/Extensions/withBlockExtensions';

import ContextNavigation from './ContextNavigation';
import variations from './variations';

export function useChildren(location) {
  const dispatch = useDispatch();
  React.useEffect(() => {
    const action = getContent(location, null, location);
    dispatch(action);
  }, [location, dispatch]);

  const items = useSelector(
    (state) => state.content.subrequests?.[location]?.data?.items || [],
  );
  return items;
}

export default function View(props) {
  const { data = {} } = props;
  let root_path = data?.root_path;
  if (typeof root_path === 'undefined') {
    root_path = '/';
  }
  let items = useChildren(root_path);
  if (root_path === '/') {
    items = [];
  }

  // Blocks saved before variations were introduced have no `variation` set,
  // so always fall back to the default (Accordion) variation.
  const { resolvedExtensions } = resolveBlockExtensions(data);
  const variation =
    resolvedExtensions?.variation ||
    variations.find((item) => item.isDefault) ||
    variations[0];
  const Variation = variation?.view || ContextNavigation;

  if (!items.length) {
    return null;
  }

  return (
    <div
      className={cx(
        'block context-navigation-block',
        variation && `variation-${variation.id}`,
      )}
    >
      <Variation items={items} data={data} location={{ pathname: root_path }} />
    </div>
  );
}
