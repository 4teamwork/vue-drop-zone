<template>
  <VuetifyLayout>
    <DropZone
        id="dropzone"
        @entered="msg = 'Entered!'"
        @left="msg = 'Left!'"
        @dropped="drop()"
        v-model="files"
        :endpoint="endpoint">
      <v-layout wrap align-center justify-center>
        <v-flex xs12>
          <v-text-field v-model="endpoint" label="Endpoint" />
        </v-flex>
        <v-flex
            d-flex
            align-center
            justify-center
            id="dropzone-slot">
          {{ msg }}
        </v-flex>
        <v-flex xs12>
          <v-list>
            <v-list-tile :key="file.id" v-for="file in files">
              <v-list-tile-action>
                <v-progress-circular :value="file.progress.percentage" />
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{ file.name }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
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
      files: [],
      endpoint: 'https://master.tus.io/files/',
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
