const fields = ['root_path', 'depth', 'title', 'types'];

const schema = ({ contentTypes }) => {
  const availableTypes = contentTypes.map((type) => [
    type.id,
    type.title || type.name,
  ]);
  return {
    title: 'Context navigation',

    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields,
      },
    ],

    properties: {
      root_path: {
        title: 'Rooth path',
        type: 'string',
        description:
          'Ex: /en/knowledge-and-data/regional-adaptation-support-tool',
        required: true,
        noValueOption: false,
      },
      depth: {
        title: 'Depth',
        type: 'integer',
        description:
          'How many extra levels below the root path to display. 0 (default) shows only the direct children of the root path, 1 also shows their children, and so on.',
        minimum: 0,
      },
      title: {
        title: 'Title',
      },
      types: {
        title: 'Display content types',
        description: 'Choose content types displayed as children',
        choices: availableTypes,
        isMulti: true,
      },
    },

    required: [],
  };
};

export default schema;
