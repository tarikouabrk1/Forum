<template>
  <div class="notification-container">
    <b-toast
      v-for="notification in notifications"
      :key="notification.id"
      :variant="notification.type"
      :title="getTitle(notification.type)"
      :visible="true"
      @hidden="removeNotification(notification.id)"
    >
      {{ notification.message }}
    </b-toast>
  </div>
</template>

<script>
import { computed } from "vue";
import useNotification from "@/composables/useNotification";

export default {
  name: "NotificationN",
  setup() {
    const { notifications, removeNotification } = useNotification();

    const getTitle = (type) => {
      switch (type) {
        case "success":
          return "Succès";
        case "danger":
          return "Erreur";
        case "warning":
          return "Attention";
        default:
          return "Information";
      }
    };

    return {
      notifications: computed(() => notifications.value),
      removeNotification,
      getTitle,
    };
  },
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1050;
}
</style>
