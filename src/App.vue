```vue
<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "./components/Navbar.vue";
</script>

<template>
  <div class="app-shell">
    <Navbar />

    <main class="app-content">
      <RouterView />
    </main>
  </div>
</template>

<style>
html,
body,
#app {
  min-height: 100%;
  margin: 0;
}

body {
  font-family:
    Inter,
    Avenir,
    Helvetica,
    Arial,
    sans-serif;

  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  width: 100%;
}
</style>
```
