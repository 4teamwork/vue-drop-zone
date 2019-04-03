export default class VueStore {
  constructor(vue) {
    this.state = {};
    this.callbacks = [];
    this.vue = vue;
  }

  getState() { return this.state; }

  setState(patch) {
    const prevState = Object.assign({}, this.state);
    const nextState = Object.assign({}, this.state, patch);

    this.state = nextState;
    this.publish(prevState, nextState, patch);
    this.notifyVue(this.state);
  }

  subscribe(listener) {
    this.callbacks.push(listener);
    return () => { this.callbacks.splice(this.callbacks.indexOf(listener), 1); };
  }

  publish(...args) {
    this.callbacks.forEach((listener) => { listener(...args); });
  }

  notifyVue(state) { this.vue.$emit('input', Object.values(state.files)); }
}
