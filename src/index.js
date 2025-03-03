import installContextNavigation from './ContextNavigation';
const applyConfig = (config) => {
  // enable context-navigation
  if (config.blocks.blocksConfig.contextNavigation)
    config.blocks.blocksConfig.contextNavigation.restricted = false;
  
  const final = [
    installContextNavigation,
  ].reduce((acc, apply) => apply(acc), config);

  return final;
};

export default applyConfig;
