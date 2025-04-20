<template>
  <div id="app">
    <navbar />
    <main class="py-4">
      <router-view />
    </main>
    <notification />
  </div>
</template>

<script>
import Navbar from "@/components/NavbarNavbar.vue";
import Notification from "@/components/NotificationN.vue";

export default {
  name: "App",
  components: {
    Navbar,
    Notification,
  },
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
