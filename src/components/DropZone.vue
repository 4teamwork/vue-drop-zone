<template>
  <div
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
  ><slot /></div>
</template>

<script>
import merge from 'lodash/merge';
import client from '../client';

export default {
  name: 'DropZone',
  data() {
    return {
      dragCount: 0,
      client,
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
      default: () => 'TUS',
      validator: m => ['TUS', 'XHR'].includes(m),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    handleDragEnter() {
      if (this.dragCount === 0) {
        this.$emit('entered');
      }
      this.dragCount += 1;
    },
    handleDragLeave() {
      this.dragCount -= 1;
      if (this.dragCount === 0) {
        this.$emit('left');
      }
    },
    handleDrop({ dataTransfer: { files } }) {
      this.dragCount = 0;
      this.$emit('dropped');
      this.client.upload(Array.from(files));
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
    this.client.uppy.on('upload-error', file => this.$emit('error', file));
    this.client.uppy.on('upload-success', () => this.$emit('success'));
  },
  destroyed() {
    window.removeEventListener('dragover', this.preventDefault);
    window.removeEventListener('drop', this.preventDefault);
  },
  watch: {
    endpoint(endpoint) { this.client.reset(merge(this.options, { uploader: { endpoint } })); },
    mode(mode) { this.client.reset(merge(this.options, { mode })); },
  },
};
</script>
