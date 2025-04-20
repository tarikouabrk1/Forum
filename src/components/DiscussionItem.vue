<template>
  <b-card class="mb-3 discussion-item" no-body>
    <b-card-body>
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <router-link
            :to="`/discussion/${discussion.id}`"
            class="discussion-title"
          >
            <h4>{{ discussion.title }}</h4>
          </router-link>

          <div class="discussion-meta">
            <b-badge variant="primary" class="mr-2">{{ categoryName }}</b-badge>
            <span class="text-muted">
              Par {{ discussion.authorName }} ·
              {{ formatDate(discussion.createdAt) }} ·
              {{ discussion.responseCount || 0 }} réponses
            </span>
            <div v-if="isAuthor">
              <router-link :to="`/discussion/${discussion.id}/edit`">
                <b-button variant="warning">Modifier</b-button>
              </router-link>
            </div>
          </div>
        </div>

        <div class="discussion-actions" v-if="isAuthor || isAdmin">
          <b-dropdown right variant="link" no-caret>
            <template #button-content>
              <b-icon icon="three-dots-vertical"></b-icon>
            </template>
            <b-dropdown-item :to="`/discussion/${discussion.id}/edit`"
              >Modifier</b-dropdown-item
            >
            <b-dropdown-item @click="confirmDelete">Supprimer</b-dropdown-item>
          </b-dropdown>
        </div>
      </div>

      <p class="discussion-preview mt-2">
        {{ truncateContent(discussion.content) }}
      </p>
    </b-card-body>
  </b-card>

  <!-- Modal de confirmation de suppression -->
  <b-modal
    v-model="showDeleteModal"
    title="Confirmer la suppression"
    @ok="deleteDiscussion"
  >
    <p>
      Êtes-vous sûr de vouloir supprimer cette discussion? Cette action est
      irréversible.
    </p>
  </b-modal>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "DiscussionItem",
  props: {
    discussion: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const { user } = useAuth();
    const { deleteDocument } = useFirestore("discussions");
    const { addNotification } = useNotification();
    const categoriesStore = useFirestore("categories");

    const categoryName = ref("");
    const showDeleteModal = ref(false);

    const isAuthor = computed(() => {
      return user.value && user.value.uid === props.discussion.authorId;
    });

    const isAdmin = computed(() => {
      if (!user.value) return false;
      return user.value.email === "admin@example.com"; // À remplacer par votre logique d'admin
    });

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

    const truncateContent = (content) => {
      if (!content) return "";
      return content.length > 150 ? content.substring(0, 150) + "..." : content;
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteDiscussion = async () => {
      try {
        await deleteDocument(props.discussion.id);
        addNotification("Discussion supprimée avec succès", "success");
      } catch (error) {
        addNotification(
          "Erreur lors de la suppression: " + error.message,
          "danger"
        );
      }
    };

    const loadCategoryName = async () => {
      if (props.discussion.categoryId) {
        try {
          const category = await categoriesStore.getDocument(
            props.discussion.categoryId
          );
          if (category) {
            categoryName.value = category.name;
          }
        } catch (error) {
          console.error("Erreur lors du chargement de la catégorie:", error);
        }
      }
    };

    onMounted(() => {
      loadCategoryName();
    });

    return {
      isAuthor,
      isAdmin,
      categoryName,
      showDeleteModal,
      formatDate,
      truncateContent,
      confirmDelete,
      deleteDiscussion,
    };
  },
};
</script>

<style scoped>
.discussion-title {
  color: inherit;
  text-decoration: none;
}

.discussion-title:hover {
  color: #007bff;
}

.discussion-meta {
  font-size: 0.9rem;
}

.discussion-preview {
  color: #6c757d;
}
</style>
