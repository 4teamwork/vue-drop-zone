<template>
  <div
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
  ><slot /></div>
</template>

<script>
export default {
  name: 'DropZone',
  data() {
    return {
      dragCount: 0,
    };
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
    handleDrop() {
      this.$emit('dropped');
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
  },
  destroyed() {
    window.removeEventListener('dragover', this.preventDefault);
    window.removeEventListener('drop', this.preventDefault);
  },
};
</script>
