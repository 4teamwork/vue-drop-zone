<template>
  <label
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :for="uuid"
      :class="{ disabled }"
  >
    <input
        v-if="fileBrowser"
        :id="uuid"
        @change="handleFileInput"
        :multiple="multiple"
        type="file"
        :disabled="disabled"
        style="display: none;" />
    <slot />
  </label>
</template>

<script>
import uuidv4 from 'uuid/v4';
import merge from 'lodash/merge';
import Client, { MODES, DEFAULT_MODE } from '../client';

export default {
  name: 'DropZone',
  data() {
    return {
      dragCount: 0,
      client: null,
      uuid: uuidv4(),
    };
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
    endpoint: {
      type: String,
      default: () => document.URL,
    },
    mode: {
      type: String,
      default: () => DEFAULT_MODE,
      validator: m => MODES.includes(m),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    /**
     * A list of uppy plugins in the format:
     * [PluginClass] or
     * [[PluginClass, PluginOptions]] if providing plugin options
     */
    plugins: {
      type: Array,
      default: () => ([]),
    },
    fileBrowser: {
      type: Boolean,
      default: () => false,
    },
    multiple: {
      type: Boolean,
      default: () => true,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  methods: {
    handleDragEnter({ dataTransfer: { types } }) {
      if (this.disabled) return;
      if (!types.includes('Files')) { return; }

      if (this.dragCount === 0) {
        this.$emit('entered');
      }
      this.dragCount += 1;
    },
    handleDragLeave({ dataTransfer: { types } }) {
      if (this.disabled) return;
      if (!types.includes('Files')) { return; }

      this.dragCount -= 1;
      if (this.dragCount === 0) {
        this.$emit('left');
      }
    },
    handleDrop({ dataTransfer: { files, types } }) {
      if (this.disabled) return;
      if (!types.includes('Files')) { return; }

      this.dragCount = 0;
      this.$emit('dropped');

      if (!this.multiple && files.length > 1) {
        this.$emit('maxFilesExceeded');
      } else {
        this.handleUpload(files);
      }
    },
    handleFileInput({ target: { files } }) {
      if (this.disabled) return;
      this.handleUpload(files);
    },
    async handleUpload(files) {
      try {
        if (this.options.preventUpload) {
          this.$emit('upload', files);
        } else {
          await this.client.upload(Array.from(files));
        }
      } catch (error) {
        this.$emit('error', error);
      }
    },
    preventDefault(e) { e.preventDefault(); },
  },
  created() {
    /**
     * Prevent browser from default behaviour when dragging
     * on other elements than the drop zone.
     * This will prevent files from being opened by the browser
     * when droppped elsewhere than the dropzone.
     */
    window.addEventListener('dragover', this.preventDefault);
    window.addEventListener('drop', this.preventDefault);

    const options = merge(
      this.options,
      { uploader: { endpoint: this.endpoint }, mode: this.mode },
    );
    this.client = new Client(this, options);
    this.plugins.forEach(plugin => this.client.uppy.use(...[plugin].flatMap(p => p)));
    this.client.uppy.on('upload-error', file => this.$emit('error', file));
    this.client.uppy.on('upload-success', (...props) => this.$emit('success', ...props));
  },
  destroyed() {
    window.removeEventListener('dragover', this.preventDefault);
    window.removeEventListener('drop', this.preventDefault);
  },
  watch: {
    endpoint(endpoint) { this.client.updateEndpoint(endpoint, this.options); },
    mode(mode) { this.client.reset(merge(this.options, { mode })); },
  },
};
</script>
