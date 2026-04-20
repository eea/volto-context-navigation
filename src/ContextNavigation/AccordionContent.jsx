import React from 'react';
import { List } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { compose } from 'redux';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';
import { useChildren } from './View';

const AccordionContent = (props) => {
  const {
    main,
    curent_location,
    data: { types = [] },
  } = props;
  const location = main.url;

  // React.useEffect(() => {
  //   const action = getContent(location, null, location);
  //   dispatch(action);
  // }, [location, dispatch]);

  // items = useSelector(
  //   (state) => state.content?.subrequests?.[location]?.data?.items || [],
  // );
  const items = useChildren(location);
  const filteredItems = items.filter((item) =>
    types.length ? types.includes(item['@type']) : item,
  );
  const normalizePath = (path = '') => {
    const normalized = getBaseUrl(path) || '/';
    const squashed = normalized.replace(/\/{2,}/g, '/');
    const withLeadingSlash = `/${squashed.replace(/^\/+/, '')}`;
    return withLeadingSlash === '/'
      ? '/'
      : withLeadingSlash.replace(/\/+$/, '');
  };
  const currentPath = normalizePath(curent_location?.pathname);

  return filteredItems.length ? (
    <div className="dataset-content">
      <div>
        {filteredItems.map((item) => {
          const itemHref = flattenToAppURL(
            getBaseUrl(item?.['@id'] || item?.url || ''),
          );
          const itemPath = normalizePath(itemHref);
          const isActive =
            itemPath === '/'
              ? currentPath === '/'
              : currentPath === itemPath ||
                currentPath.startsWith(`${itemPath}/`);

          return (
            <List.Item
              key={item.id || item?.['@id'] || itemHref}
              className={isActive ? 'active' : ''}
            >
              <List.Content>
                <div className="dataset-item">
                  <Link to={itemHref}>{item.title}</Link>
                </div>
              </List.Content>
            </List.Item>
          );
        })}
      </div>
    </div>
  ) : null;
};

export default compose()(AccordionContent);
