import Uppy from '@uppy/core';
import Tus from '@uppy/tus';
import XHR from '@uppy/xhr-upload';
import VueStore from './vuestore';

function isFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      reject(new Error('No folders allowed'));
    };
    reader.onload = () => {
      resolve(true);
    };

    reader.readAsBinaryString(file);
  });
}

function hasFiles(files) { return Object.keys(files).length > 0; }

function createUppyClient(vm, options = {}) {
  if (!vm) { throw new Error('No vue instance is provided'); }

  const store = new VueStore(vm);
  return Uppy(Object.assign({
    store,
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

export default class Client {
  constructor(vm, options = {}) {
    this.uppy = createUppyClient(vm, options.uppy);
    this.installPlugin(options.uploader, options.mode);
  }

  installPlugin(options = {}, mode = 'TUS') {
    this.uppy.use(
      MODE_MAPPING[mode].uploader,
      Object.assign(MODE_MAPPING[mode].options || {}, options),
    );
  }

  reset(options = {}) {
    if (this.uppy) {
      this.uppy.close();
      this.installPlugin(options, options.mode);
    }
  }

  async upload(files = []) {
    const results = await Promise.all(files.map(f => isFile(f)));
    if (results.every(f => f === true)) { files.forEach(f => this.addFile(f)); }
    return this.uppy.upload();
  }

  addFile(file) {
    this.uppy.addFile({ name: file.name, type: file.type, data: file });
  }
}
