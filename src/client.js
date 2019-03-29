import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import VueStore from './vuestore';

function isFolder(file) { return file.type && file.size % 4096 !== 0; }

function hasFiles(files) { return Object.keys(files).length > 0; }

function createUppyClient(vm) {
  if (!vm) { throw new Error('No vue instance is provided'); }

  const store = new VueStore(vm);
  return Uppy({
    store,
    onBeforeFileAdded: isFolder,
    onBeforeUpload: hasFiles,
  });
}

const DEFAULT_TUS_PLUGIN_CONFIG = {
  headers: {
    Accept: 'application/json',
  },
  limit: 1,
  resume: false,
};

const client = {
  installTusPlugin(options = {}) { this.uppy.use(Tus, options); },
  init(vm, options = {}) {
    this.uppy = createUppyClient(vm);
    this.installTusPlugin(Object.assign(DEFAULT_TUS_PLUGIN_CONFIG, options));
  },
  reset(options = {}) {
    if (this.uppy) {
      this.uppy.close();
      this.installTusPlugin(Object.assign(DEFAULT_TUS_PLUGIN_CONFIG, options));
    }
  },
  async upload(files = []) {
    if (!this.uppy) { throw new Error('Client has not been initialized'); }
    files.forEach(f => this.addFile(f));
    return this.uppy.upload();
  },
  addFile(file) {
    if (!this.uppy) { throw new Error('Client has not been initialized'); }
    this.uppy.addFile({ name: file.name, type: file.type, data: file });
  },
};

export default client;
