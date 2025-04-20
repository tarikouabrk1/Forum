<template>
  <div class="debug-page">
    <b-container>
      <h1 class="mb-4">Page de débogage</h1>
      <debug-tools />
    </b-container>
  </div>
</template>

<script>
import DebugTools from "@/components/DebugTools.vue";

export default {
  name: "DebugDebug",
  components: {
    DebugTools,
  },
};
</script>
