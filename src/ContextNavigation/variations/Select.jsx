import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import cx from 'classnames';
import { flattenToAppURL, getBaseUrl } from '@plone/volto/helpers/Url/Url';

const messages = defineMessages({
  navigation: {
    id: 'Navigation',
    defaultMessage: 'Navigation',
  },
});

const normalizePath = (path = '') => {
  const normalized = getBaseUrl(path) || '/';
  const squashed = normalized.replace(/\/{2,}/g, '/');
  const withLeadingSlash = `/${squashed.replace(/^\/+/, '')}`;
  return withLeadingSlash === '/' ? '/' : withLeadingSlash.replace(/\/+$/, '');
};

const getItemUrl = (item) => {
  const url = item?.url || item?.['@id'] || '';
  return flattenToAppURL(url);
};

/**
 * Select variation: the trigger shows the current (active) page and the
 * dropdown lists the siblings found under `root_path`, filtered by the
 * configured content types.
 */
const Select = (props) => {
  const { items = [], data = {} } = props;
  const intl = useIntl();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef(null);
  const triggerRef = React.useRef(null);

  const filteredItems = React.useMemo(() => {
    const types = data.types || [];
    return items.filter((item) =>
      types.length ? types.includes(item['@type']) : true,
    );
  }, [items, data.types]);

  const currentPath = normalizePath(location?.pathname);

  const activeItem = React.useMemo(
    () =>
      filteredItems.find((item) => {
        const itemPath = normalizePath(getItemUrl(item));
        return (
          itemPath === currentPath || currentPath.startsWith(`${itemPath}/`)
        );
      }),
    [filteredItems, currentPath],
  );

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!filteredItems.length) return null;

  const triggerLabel =
    activeItem?.title || data.title || intl.formatMessage(messages.navigation);

  return (
    <div
      className={cx('context-navigation-select', { open: isOpen })}
      ref={containerRef}
    >
      <button
        type="button"
        ref={triggerRef}
        className="context-navigation-select-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="context-navigation-select-label">{triggerLabel}</span>
        <Icon
          className={isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
        />
      </button>
      {isOpen && (
        <ul className="context-navigation-select-menu" role="menu">
          {filteredItems.map((item, index) => {
            const itemUrl = getItemUrl(item);
            const isActive = item === activeItem;
            return (
              <li role="none" key={itemUrl || item.id || index}>
                <Link
                  role="menuitem"
                  to={itemUrl}
                  className={cx({ active: isActive })}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
