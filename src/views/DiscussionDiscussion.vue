<template>
  <div class="discussion-view">
    <b-container>
      <!-- Chargement -->
      <div v-if="isPending" class="text-center p-5">
        <b-spinner variant="primary" label="Chargement..."></b-spinner>
        <p>Chargement en cours...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="text-center p-5">
        <b-alert show variant="danger">{{ error }}</b-alert>
        <b-button to="/" variant="primary" class="mt-3">
          Retour à l'accueil
        </b-button>
      </div>

      <!-- Contenu -->
      <template v-else>
        <b-breadcrumb :items="breadcrumbItems"></b-breadcrumb>

        <b-card class="mb-4">
          <template #header>
            <div class="d-flex justify-content-between align-items-start">
              <h2 class="mb-0">
                {{ discussion.title || "[Titre non défini]" }}
              </h2>
              <div class="discussion-actions" v-if="isAuthor || isAdmin">
                <b-dropdown right variant="link" no-caret>
                  <template #button-content>
                    <b-icon icon="three-dots-vertical"></b-icon>
                  </template>
                  <b-dropdown-item :to="`/discussion/${discussionId}/edit`"
                    >Modifier</b-dropdown-item
                  >
                  <b-dropdown-item @click="confirmDelete"
                    >Supprimer</b-dropdown-item
                  >
                </b-dropdown>
              </div>
            </div>
          </template>

          <div class="discussion-meta mb-3">
            <b-badge variant="primary" class="mr-2">
              {{ categoryName || "Catégorie inconnue" }}
            </b-badge>
            <span class="text-muted">
              Par {{ discussion.authorName || "Auteur inconnu" }} ·
              {{ formatDate(discussion.createdAt) }}
              <span v-if="discussion.edited">
                · Modifié le {{ formatDate(discussion.updatedAt) }}
              </span>
            </span>
          </div>

          <div class="discussion-content">
            <p>{{ discussion.content || "[Contenu vide]" }}</p>
          </div>
        </b-card>

        <response-list :discussion-id="discussionId" />
      </template>

      <!-- Modal de confirmation de suppression -->
      <b-modal
        v-model="showDeleteModal"
        title="Confirmer la suppression"
        @ok="deleteDiscussion"
      >
        <p>
          Êtes-vous sûr de vouloir supprimer cette discussion ? Cette action est
          irréversible.
        </p>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";
import ResponseList from "@/components/ResponseList.vue";
import { createTestResponse as createTestResponseUtil } from "@/utils/create-test-response.js";

export default {
  name: "DiscussionDiscussion",
  components: {
    ResponseList,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { user } = useAuth();
    const {
      getDocument,
      deleteDocument,
      error: firestoreError,
      isPending,
    } = useFirestore("discussions");

    const categoriesStore = useFirestore("categories");
    const { addNotification } = useNotification();

    const discussionId = route.params.discussionId;
    const discussion = ref({});
    const categoryName = ref("");
    const error = ref(null);
    const showDeleteModal = ref(false);

    const isAuthor = computed(() => {
      return user.value && user.value.uid === discussion.value.authorId;
    });

    const isAdmin = computed(() => {
      return user.value && user.value.email === "admin@example.com";
    });

    const breadcrumbItems = computed(() => [
      { text: "Accueil", to: "/" },
      {
        text: categoryName.value || "Catégorie",
        to: `/category/${discussion.value.categoryId || "inconnue"}`,
      },
      { text: discussion.value.title || "Discussion", active: true },
    ]);

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

    const loadDiscussion = async () => {
      console.log("Chargement de la discussion", discussionId);
      try {
        const doc = await getDocument(discussionId);
        console.log("Document Firestore récupéré :", doc);

        if (doc) {
          discussion.value = doc;

          if (doc.categoryId) {
            const category = await categoriesStore.getDocument(doc.categoryId);
            if (category) {
              categoryName.value = category.name;
            }
          }
        } else {
          error.value = "Discussion non trouvée";
        }

        if (firestoreError.value) {
          error.value = firestoreError.value;
        }
      } catch (err) {
        console.error("Erreur lors du chargement de la discussion :", err);
        error.value = err.message;
      }
    };

    const confirmDelete = () => {
      showDeleteModal.value = true;
    };

    const deleteDiscussion = async () => {
      try {
        await deleteDocument(discussionId);
        addNotification("Discussion supprimée avec succès", "success");
        router.push("/");
      } catch (err) {
        addNotification(
          "Erreur lors de la suppression : " + err.message,
          "danger"
        );
      }
    };

    const addTestResponse = async () => {
      try {
        const responseId = await createTestResponseUtil(discussionId);
        if (responseId) {
          addNotification("Réponse de test créée avec succès", "success");
        }
      } catch (err) {
        addNotification(
          "Erreur lors de la création de la réponse de test",
          "danger"
        );
      }
    };

    onMounted(() => {
      if (!discussionId) {
        console.warn("Aucun ID de discussion fourni");
        error.value = "Aucun ID de discussion fourni";
        return;
      }
      loadDiscussion();
    });

    return {
      discussionId,
      discussion,
      categoryName,
      error,
      isPending,
      isAuthor,
      isAdmin,
      breadcrumbItems,
      showDeleteModal,
      formatDate,
      confirmDelete,
      deleteDiscussion,
      user,
      addTestResponse,
    };
  },
};
</script>

<style scoped>
.debug-section {
  font-size: 0.85rem;
  color: #444;
}
</style>
