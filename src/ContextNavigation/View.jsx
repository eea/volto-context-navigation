import React from 'react';
import './styles.less';
import cx from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions/content/content';
import { searchContent } from '@plone/volto/actions/search/search';
import { resolveBlockExtensions } from '@plone/volto/helpers/Extensions/withBlockExtensions';

import ContextNavigation from './ContextNavigation';
import variations from './variations';
import { flattenDescendants, getDepth } from './helpers';

const EMPTY = [];

/**
 * Fetch the direct children of a folder.
 * @function useChildren
 * @param {string} location Folder path. Falsy skips the request.
 * @returns {Array} Children of the folder, in folder order.
 */
export function useChildren(location) {
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (!location) return;
    const action = getContent(location, null, location);
    dispatch(action);
  }, [location, dispatch]);

  const items = useSelector(
    (state) => state.content?.subrequests?.[location]?.data?.items || EMPTY,
  );
  return items;
}

/**
 * Fetch everything below a folder: its children plus `depth` extra levels.
 * A single `@search` request is used and the results are flattened depth-first,
 * so a parent is always immediately followed by its own children.
 * @function useDescendants
 * @param {string} location Root folder path. Falsy skips the request.
 * @param {number} depth Extra levels below the root path. `0` = direct children.
 * @returns {Array} Flat, ordered items.
 */
export function useDescendants(location, depth = 0) {
  const dispatch = useDispatch();
  const subrequest = React.useMemo(
    () => `${location}::depth=${depth}`,
    [location, depth],
  );

  React.useEffect(() => {
    // `depth` 0 is the classic behaviour, the children of `root_path` are
    // already fetched with `useChildren`.
    if (!location || location === '/' || depth <= 0) return;
    dispatch(
      searchContent(
        location,
        {
          path: location,
          // `path.depth: 1` already means "the direct children", so one level
          // is added for the extra levels configured on the block.
          'path.depth': depth + 1,
          sort_on: 'path',
          metadata_fields: 'getObjPositionInParent',
          b_size: 1000,
        },
        subrequest,
      ),
    );
  }, [location, depth, subrequest, dispatch]);

  const items = useSelector(
    (state) => state.search?.subrequests?.[subrequest]?.items || EMPTY,
  );

  return React.useMemo(
    () => flattenDescendants(items, location),
    [items, location],
  );
}

export default function View(props) {
  const { data = {} } = props;
  const root_path = data?.root_path ?? '/';
  const depth = getDepth(data);

  // `depth` 0 keeps the classic behaviour: the children of `root_path` only.
  const children = useChildren(depth > 0 ? null : root_path);
  const descendants = useDescendants(root_path, depth);

  let items = root_path === '/' ? [] : depth > 0 ? descendants : children;

  // Blocks saved before variations were introduced have no `variation` set,
  // so always fall back to the default (Accordion) variation.
  const { resolvedExtensions } = resolveBlockExtensions(data);
  const variation =
    resolvedExtensions?.variation ||
    variations.find((item) => item.isDefault) ||
    variations[0];
  const Variation = variation?.view || ContextNavigation;

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
