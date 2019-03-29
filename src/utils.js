import path from 'path';
import { upperFirst, camelCase } from 'lodash';

export function toPascalCase(string) {
  return upperFirst(camelCase(string));
}

export function resolveComponents(components) {
  return components.keys().map((fileName) => {
    // Get component config
    const component = components(fileName);

    // Get PascalCase name of component
    const name = toPascalCase(path.basename(fileName).replace('.vue', ''));

    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    return { component: component.default || component, name, fileName };
  });
}
