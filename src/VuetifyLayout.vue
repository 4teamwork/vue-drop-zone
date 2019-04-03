<template>
  <v-app>
      <v-content>
        <v-container grid-list-lg>
          <slot />
        </v-container>
      </v-content>
    </v-app>
</template>

<script>
export default {
  name: 'VuetifyLayout',
};
</script>
