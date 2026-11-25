import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  noItems: {
    id: 'No items available',
    defaultMessage: 'No items available',
  },
});

/**
 * Placeholder rendered when the block has nothing to display: no children
 * under `root_path`, or every child was filtered out by the selected types.
 */
const EmptyState = (props) => {
  const { title } = props;
  const intl = useIntl();

  return (
    <>
      {title ? <div className="context-navigation-header">{title}</div> : null}
      <p className="context-navigation-empty">
        {intl.formatMessage(messages.noItems)}
      </p>
    </>
  );
};

export default EmptyState;
