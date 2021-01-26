import Uppy from '@uppy/core';
import VueStore from './vuestore';

function isFile(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onerror = () => {
      reader.abort();
      const error = new Error('Upload canceled because folders cannot be uploaded');
      error.name = 'FoldersNotAllowedError';
      reject(error);
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

export default class Client {
  constructor(vm, uploader, options = {}) {
    this.uploader = uploader;
    this.uppy = createUppyClient(vm, options.uppy);
    this.installPlugin(uploader.uploaderClass, uploader.options);
  }

  installPlugin(plugin, options = {}) {
    this.uppy.use(plugin, options);
  }

  updateEndpoint(endpoint, pluginId) {
    this.uppy.getPlugin(pluginId).opts.endpoint = endpoint;
  }

  reset(uploader) {
    if (this.uppy) {
      this.uppy.close();
      const { uploaderClass, options } = uploader || this.uploader;
      this.installPlugin(uploaderClass, options || {});
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
