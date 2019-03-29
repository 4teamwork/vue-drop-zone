import Vue from 'vue';
import { resolveComponents } from '@/utils';

/**
 * Automatically loads all files in ./components
 * and initializes according components in Vue.
 * See https://goo.gl/NqtXNE
 */

const requireComponent = require.context(
  // The relative path of the components folder
  './components',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /\.(vue)$/,
);

// Register components globally
resolveComponents(requireComponent).forEach(({ name, component, fileName }) => {
  const registeredComponents = Object.keys(Vue.options.components);
  if (registeredComponents.includes(name)) {
    throw new Error(`Naming clash: The component under ${fileName} could not be registered, because there is already a component with the same name registered.`);
  }
  Vue.component(name, component);
});
