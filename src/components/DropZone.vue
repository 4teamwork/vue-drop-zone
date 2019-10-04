<template>
  <label
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
      :for="uuid"
  >
    <input
        v-if="fileBrowser"
        :id="uuid"
        @change="handleFileInput"
        multiple
        type="file"
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
    fileBrowser: {
      type: Boolean,
      default: () => false,
    },
  },
  methods: {
    handleDragEnter({ dataTransfer: { types } }) {
      if (!types.includes('Files')) { return; }

      if (this.dragCount === 0) {
        this.$emit('entered');
      }
      this.dragCount += 1;
    },
    handleDragLeave({ dataTransfer: { types } }) {
      if (!types.includes('Files')) { return; }

      this.dragCount -= 1;
      if (this.dragCount === 0) {
        this.$emit('left');
      }
    },
    handleDrop({ dataTransfer: { files, types } }) {
      if (!types.includes('Files')) { return; }

      this.dragCount = 0;
      this.$emit('dropped');
      this.handleUpload(files);
    },
    handleFileInput({ target: { files } }) {
      this.handleUpload(files);
    },
    async handleUpload(files) {
      try {
        if (!this.options.preventUpload) {
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
    this.client.uppy.on('upload-error', file => this.$emit('error', file));
    this.client.uppy.on('upload-success', () => this.$emit('success'));
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
