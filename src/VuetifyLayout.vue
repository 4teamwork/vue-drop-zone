<template>
  <v-app>
      <v-content>
        <v-container>
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
