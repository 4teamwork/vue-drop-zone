import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import XHR from '@uppy/xhr-upload';
import VueStore from './vuestore';

function isFolder(file) { return file.type && file.size % 4096 !== 0; }

function hasFiles(files) { return Object.keys(files).length > 0; }

function createUppyClient(vm, options = {}) {
  if (!vm) { throw new Error('No vue instance is provided'); }

  const store = new VueStore(vm);
  return Uppy(Object.assign({
    store,
    onBeforeFileAdded: isFolder,
    onBeforeUpload: hasFiles,
  }, options));
}

const MODE_MAPPING = {
  TUS: {
    uploader: Tus,
    options: {
      headers: { Accept: 'application/json' },
      limit: 1,
      resume: false,
    },
  },
  XHR: { uploader: XHR },
};

const client = {
  installPlugin(options = {}, mode = 'TUS') {
    this.uppy.use(
      MODE_MAPPING[mode].uploader,
      Object.assign(MODE_MAPPING[mode].options || {}, options),
    );
  },
  init(vm, options = {}) {
    this.uppy = createUppyClient(vm, options.uppy);
    this.installPlugin(options.uploader, options.mode);
  },
  reset(options = {}) {
    if (this.uppy) {
      this.uppy.close();
      this.installPlugin(options, options.mode);
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
