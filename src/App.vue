<template>
  <VuetifyLayout>
    <DropZone
        id="dropzone"
        @entered="msg = 'Entered!'"
        @left="msg = 'Left!'"
        @dropped="drop()">
      <v-layout align-center justify-center>
        <v-flex
            d-flex
            align-center
            justify-center
            id="dropzone-slot">
          {{ msg }}
        </v-flex>
      </v-layout>
    </DropZone>
  </VuetifyLayout>
</template>

<script>
import VuetifyLayout from '@/VuetifyLayout.vue';

export default {
  name: 'app',
  components: { VuetifyLayout },
  data() {
    return {
      msg: 'Drop Here!',
    };
  },
  methods: {
    drop() {
      this.msg = 'Dropped!';
      window.setTimeout(() => { this.msg = 'Drop Here!'; }, 1000);
    },
  },
};
</script>
<style>

#dropzone-slot {
  border: 2px dashed lightgray;
  height: 200px;
  max-width: 200px;
}
</style>
