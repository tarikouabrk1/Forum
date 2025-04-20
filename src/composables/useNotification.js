import { ref } from "vue";

const notifications = ref([]);

const useNotification = () => {
  const addNotification = (message, type = "info", timeout = 5000) => {
    const id = Date.now().toString();

    notifications.value.push({
      id,
      message,
      type,
      timeout,
    });

    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, timeout);
    }

    return id;
  };

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter(
      (notification) => notification.id !== id
    );
  };

  return { notifications, addNotification, removeNotification };
};

export default useNotification;
