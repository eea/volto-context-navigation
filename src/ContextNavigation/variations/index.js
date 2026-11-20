import ContextNavigation from '../ContextNavigation';
import Select from './Select';

const variations = [
  {
    id: 'accordion',
    title: 'Accordion',
    view: ContextNavigation,
    isDefault: true,
  },
  {
    id: 'select',
    title: 'Select',
    view: Select,
  },
];

export default variations;
