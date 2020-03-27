import Vue from 'vue';
import { mount, shallowMount } from '@vue/test-utils';

function createAppContainer() {
  const appElement = document.createElement('div');
  appElement.setAttribute('data-app', 'true');
  document.body.appendChild(appElement);
}

/*
  When using vuetify with `createLocalVue` from vue-test-utils
  the error `Multiple instances of Vue detected` appears.
  This is because of https://github.com/vuejs/vue-test-utils/issues/532.
  One way to suppress this warning until vue is able to render the DOM synchronously
  (vue@2.6.x)  is to mount the component asynchronously.
  Vuetify shows an error since version 1.1.11 https://github.com/vuetifyjs/vuetify/tree/v1.1.11
  when multiple vue instances are registered. It's planned to remove this warning when vue
  is ready to render the DOM synchronously in test environments https://github.com/vuejs/vue/pull/8240.
*/
export async function localMount(component, options = {}) {
  const $route = { params: {} };
  createAppContainer();
  const wrapper = mount(component, {
    stubs: ['router-link'],
    localVue: global.localVue,
    sync: false, // see comment above
    mocks: { $route },
    ...options,
  });
  await Vue.nextTick();
  return wrapper;
}

export async function localShallow(component, options = {}) {
  const $route = { params: {} };
  createAppContainer();
  const wrapper = shallowMount(component, {
    stubs: ['router-link'],
    localVue: global.localVue,
    sync: false, // see comment above
    mocks: { $route },
    ...options,
  });
  await Vue.nextTick();
  return wrapper;
}
