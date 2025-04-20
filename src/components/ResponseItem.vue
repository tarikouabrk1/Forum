<template>
  <div class="response-item mb-4 p-3 border rounded">
    <div class="d-flex justify-content-between align-items-start">
      <div class="d-flex align-items-center">
        <div class="avatar mr-3">
          <b-avatar
            :text="getInitials(response.authorName)"
            variant="primary"
          ></b-avatar>
        </div>
        <div>
          <h5 class="mb-0">{{ response.authorName }}</h5>
          <small class="text-muted">{{ formatDate(response.createdAt) }}</small>
        </div>
      </div>

      <div class="response-actions" v-if="isAuthor || isAdmin">
        <b-dropdown right variant="link" no-caret>
          <template #button-content>
            <i class="bi bi-three-dots-vertical"></i>
          </template>
          <b-dropdown-item @click="startEditing" v-if="!editing"
            >Modifier</b-dropdown-item
          >
          <b-dropdown-item @click="confirmDelete">Supprimer</b-dropdown-item>
        </b-dropdown>
      </div>
    </div>

    <div class="response-content mt-3">
      <div v-if="!editing">
        <p>{{ response.content }}</p>
        <div v-if="response.edited" class="text-muted small">
          <i>(Modifié le {{ formatDate(response.updatedAt) }})</i>
        </div>
      </div>

      <div v-else>
        <b-form @submit.prevent="updateResponse">
          <b-form-group>
            <b-form-textarea
              v-model="editContent"
              rows="4"
              required
            ></b-form-textarea>
          </b-form-group>

          <div class="d-flex justify-content-end">
            <b-button
              type="button"
              variant="secondary"
              class="mr-2"
              @click="cancelEditing"
            >
              Annuler
            </b-button>
            <b-button type="submit" variant="primary" :disabled="isPending">
              Mettre à jour
            </b-button>
          </div>
        </b-form>
      </div>
    </div>

    <div class="response-likes mt-3 d-flex align-items-center">
      <b-button variant="outline-primary" @click="toggleLike">
        <i :class="isLiked ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
        {{ likesCount }}
      </b-button>
    </div>

    <!-- Modal de confirmation de suppression -->
    <b-modal
      v-model="showDeleteModal"
      title="Confirmer la suppression"
      @ok="deleteResponse"
    >
      <p>
        Êtes-vous sûr de vouloir supprimer cette réponse? Cette action est
        irréversible.
      </p>
    </b-modal>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "ResponseItem",
  props: {
    response: {
      type: Object,
      required: true,
    },
  },
  emits: ["deleted"],
  setup(props, { emit }) {
    const { user } = useAuth();
    const { updateDocument, deleteDocument, isPending } =
      useFirestore("responses");
    const { addNotification } = useNotification();

    const editing = ref(false);
    const editContent = ref("");
    const showDeleteModal = ref(false);

    // Détecte si l'utilisateur est l'auteur de la réponse ou un admin
    const isAuthor = computed(
      () => user.value && user.value.uid === props.response.authorId
    );
    const isAdmin = computed(
      () => user.value && user.value.email === "admin@example.com"
    );

    // Détecte si l'utilisateur a déjà liké la réponse
    const isLiked = computed(() => {
      return (
        props.response.likes &&
        props.response.likes.includes(user.value ? user.value.uid : "")
      );
    });

    // Nombre total de likes
    const likesCount = computed(() =>
      props.response.likes ? props.response.likes.length : 0
    );

    const formatDate = (timestamp) => {
      if (!timestamp) return "Date inconnue";
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    };

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const toggleLike = async () => {
      if (!user.value) {
        addNotification(
          "Veuillez vous connecter pour aimer cette réponse",
          "danger"
        );
        return;
      }

      try {
        const responseRef = props.response;

        let updatedLikes = [...responseRef.likes];

        if (isLiked.value) {
          // L'utilisateur a déjà liké cette réponse, on retire le like
          updatedLikes = updatedLikes.filter((uid) => uid !== user.value.uid);
        } else {
          // L'utilisateur n'a pas encore liké cette réponse, on ajoute le like
          updatedLikes.push(user.value.uid);
        }

        // Mise à jour des likes dans Firestore
        await updateDocument(responseRef.id, { likes: updatedLikes });

        // Notification de succès
        addNotification(
          isLiked.value
            ? "Vous avez retiré votre like"
            : "Vous avez aimé cette réponse",
          "success"
        );
      } catch (error) {
        console.error("Erreur lors du changement de like:", error);
        addNotification("Erreur lors de la mise à jour du like", "danger");
      }
    };

    const startEditing = () => {
      editContent.value = props.response.content || "";
      editing.value = true;
    };

    const cancelEditing = () => {
      editing.value = false;
      editContent.value = "";
    };

    const updateResponse = async () => {
      if (!editContent.value.trim()) return;

      try {
        await updateDocument(props.response.id, {
          content: editContent.value,
          edited: true,
          updatedAt: new Date(),
        });

        editing.value = false;
        addNotification("Réponse mise à jour avec succès", "success");
      } catch (error) {
        addNotification(
          "Erreur lors de la mise à jour: " + error.message,
          "danger"
        );
      }
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteResponse = async () => {
      try {
        await deleteDocument(props.response.id);
        addNotification("Réponse supprimée avec succès", "success");
        emit("deleted");
      } catch (error) {
        addNotification(
          "Erreur lors de la suppression: " + error.message,
          "danger"
        );
      }
    };

    return {
      editing,
      editContent,
      showDeleteModal,
      isPending,
      isAuthor,
      isAdmin,
      formatDate,
      getInitials,
      toggleLike,
      likesCount,
      isLiked,
      startEditing,
      cancelEditing,
      updateResponse,
      confirmDelete,
      deleteResponse,
    };
  },
};
</script>
