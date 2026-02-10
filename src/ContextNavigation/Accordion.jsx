import React from 'react';
import { Accordion as SemanticAccordion, Icon } from 'semantic-ui-react';

import AccordionContent from './AccordionContent';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getContent } from '@plone/volto/actions';

const useChildrenForItems = (items) => {
  const dispatch = useDispatch();
  const itemUrls = React.useMemo(() => items.map((item) => item.url), [items]);

  React.useEffect(() => {
    itemUrls.forEach((url) => {
      const action = getContent(url, null, url);
      dispatch(action);
    });
  }, [itemUrls, dispatch]);

  const allSubrequests = useSelector(
    (state) => state.content.subrequests || {},
  );

  const childrenMap = React.useMemo(() => {
    const map = {};
    itemUrls.forEach((url) => {
      map[url] = allSubrequests[url]?.data?.items || [];
    });
    return map;
  }, [itemUrls, allSubrequests]);

  return childrenMap;
};

const Accordion = (props) => {
  const { items = {}, curent_location, activeMenu, data = {} } = props;
  const [currentIndex, setIndex] = React.useState(activeMenu ?? 0);
  const history = useHistory();
  const childrenMap = useChildrenForItems(items);

  const handleClick = (e, item) => {
    let itemUrl = '/' + item['@id'].split('/').slice(3).join('/');
    history.push(itemUrl);
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
        const childItems = childrenMap[item.url];
        const { types = [] } = data;
        const filteredChildren = childItems.filter((child) =>
          types.length ? types.includes(child['@type']) : child,
        );
        const hasChildren = filteredChildren.length > 0;
        const active = currentIndex === index && hasChildren;

        return (
          <SemanticAccordion id={id} key={index} className="secondary">
            <SemanticAccordion.Title
              role="button"
              tabIndex={0}
              active={activeMenu === index && hasChildren}
              aria-expanded={activeMenu === index && hasChildren}
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
                  key={index}
                  main={{
                    title: item.title,
                    href: item['@id'],
                    url: item.url,
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
