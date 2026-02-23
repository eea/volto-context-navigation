import React from 'react';
import { Accordion as SemanticAccordion, Icon } from 'semantic-ui-react';
import { shallowEqual } from 'react-redux';

import AccordionContent from './AccordionContent';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions';
import { flattenToAppURL } from '@plone/volto/helpers';

const useChildrenForItems = (items) => {
  const dispatch = useDispatch();
  const itemUrls = React.useMemo(() => {
    return items
      .map((item) => {
        if (item.url) {
          return item.url;
        }
        if (item['@id']) {
          return flattenToAppURL(item['@id']);
        }
        return null;
      })
      .filter(Boolean);
  }, [items]);

  React.useEffect(() => {
    itemUrls.forEach((url) => {
      const action = getContent(url, null, url);
      dispatch(action);
    });
  }, [itemUrls, dispatch]);

  const childrenMap = useSelector((state) => {
    const subrequests = state.content.subrequests || {};
    const map = {};
    itemUrls.forEach((url) => {
      map[url] = subrequests[url]?.data?.items || [];
    });
    return map;
  }, shallowEqual);

  return childrenMap;
};

const Accordion = (props) => {
  const { items = [], curent_location, activeMenu, data = {} } = props;
  const [currentIndex, setIndex] = React.useState(activeMenu ?? -1);
  const history = useHistory();
  const childrenMap = useChildrenForItems(items);

  React.useEffect(() => {
    setIndex(activeMenu ?? -1);
  }, [activeMenu]);

  const getItemUrl = (item) => {
    if (item.url) {
      return item.url;
    }
    if (item['@id']) {
      return flattenToAppURL(item['@id']);
    }
    return null;
  };

  const handleClick = (e, item) => {
    const itemUrl = getItemUrl(item);
    if (itemUrl) {
      history.push(itemUrl);
    }
  };

  const handleIconClick = (e, index, hasChildren) => {
    e.stopPropagation();
    if (!hasChildren) return;
    const newIndex = currentIndex === index ? -1 : index;
    setIndex(newIndex);
  };

  return (
    <>
      <div className="context-navigation-header">{data?.title}</div>
      {items.map((item, index) => {
        const { id } = item;
        const itemUrl = getItemUrl(item);
        const childItems = childrenMap[itemUrl];
        const { types = [] } = data;
        const filteredChildren = childItems?.filter((child) =>
          types.length ? types.includes(child['@type']) : child,
        );
        const hasChildren = filteredChildren?.length > 0;
        const active = currentIndex === index && hasChildren;
        const isActiveTitle = activeMenu === index;

        return (
          <SemanticAccordion
            id={id}
            key={itemUrl || id || index}
            className="secondary"
          >
            <SemanticAccordion.Title
              role="button"
              tabIndex={0}
              active={isActiveTitle}
              aria-expanded={hasChildren ? active : false}
              index={index}
              onClick={(e) => {
                handleClick(e, item);
              }}
              onKeyDown={(e) => {
                if (e.keyCode === 13 || e.keyCode === 32) {
                  e.preventDefault();
                  handleClick(e, item);
                }
              }}
            >
              <span className="item-title">{item.title}</span>
              {hasChildren && (
                <>
                  {active ? (
                    <Icon
                      className="ri-arrow-up-s-line"
                      onClick={(e) => {
                        handleIconClick(e, index, hasChildren);
                      }}
                    />
                  ) : (
                    <Icon
                      className="ri-arrow-down-s-line"
                      onClick={(e) => {
                        handleIconClick(e, index, hasChildren);
                      }}
                    />
                  )}
                </>
              )}
            </SemanticAccordion.Title>
            {hasChildren && (
              <SemanticAccordion.Content active={active}>
                <AccordionContent
                  curent_location={curent_location}
                  main={{
                    title: item.title,
                    href: item['@id'],
                    url: itemUrl,
                  }}
                  data={data}
                />
              </SemanticAccordion.Content>
            )}
          </SemanticAccordion>
        );
      })}
    </>
  );
};

export default Accordion;
