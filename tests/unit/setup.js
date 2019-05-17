import Vue from 'vue';
import Vuetify from 'vuetify';
import MockDate from 'mockdate';
import { createLocalVue } from '@vue/test-utils';
import { resolveComponents } from '@/utils';
import requireContext from 'require-context';

Vue.config.productionTip = false;

const requireComponent = requireContext(
  // The relative path of the components folder
  '../../src/components',
  // Whether or not to look in subfolders
  true,
  // The regular expression used to match base component filenames
  /\.(vue)$/,
);

Vue.use(Vuetify);

// Fake createObjectURL
URL.createObjectURL = () => '';

// Mock computed style for transition groups
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});
const { getComputedStyle } = window;
window.getComputedStyle = function getComputedStyleStub(el) {
  return {
    ...getComputedStyle(el),
    transitionDelay: '',
    transitionDuration: '',
    animationDelay: '',
    animationDuration: '',
  };
};

const localVue = createLocalVue();

global.beforeEach(() => {
  resolveComponents(requireComponent).forEach(({ name, component }) => {
    localVue.component(name, component);
  });
  global.localVue = localVue;
  MockDate.reset();
});
