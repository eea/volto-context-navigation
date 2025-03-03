import installContextNavigation from './ContextNavigation';
const applyConfig = (config) => {
  const final = [
    installContextNavigation,
  ].reduce((acc, apply) => apply(acc), config);

  return final;
};

export default applyConfig;
