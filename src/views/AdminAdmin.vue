<template>
  <div class="admin">
    <b-container>
      <h1 class="mb-4">Administration</h1>

      <div v-if="isPending" class="text-center p-5">
        <b-spinner variant="primary" label="Chargement..."></b-spinner>
      </div>

      <div v-else-if="!isAdmin" class="text-center p-5">
        <b-alert show variant="danger">
          Vous n'avez pas les droits d'accès à cette page.
        </b-alert>
        <b-button to="/" variant="primary" class="mt-3">
          Retour à l'accueil
        </b-button>
      </div>

      <div v-else>
        <b-tabs content-class="mt-3">
          <b-tab title="Utilisateurs" active>
            <b-card>
              <template #header>
                <h3 class="mb-0">Gestion des utilisateurs</h3>
              </template>

              <b-table
                :items="users"
                :fields="userFields"
                striped
                hover
                responsive
              >
                <template #cell(actions)="data">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    @click="toggleUserRole(data.item)"
                  >
                    {{ data.item.isAdmin ? "Retirer admin" : "Faire admin" }}
                  </b-button>
                </template>
              </b-table>
            </b-card>
          </b-tab>

          <b-tab title="Catégories">
            <b-card>
              <template #header>
                <div class="d-flex justify-content-between align-items-center">
                  <h3 class="mb-0">Gestion des catégories</h3>
                  <b-button
                    size="sm"
                    variant="primary"
                    @click="showNewCategoryModal = true"
                  >
                    Nouvelle catégorie
                  </b-button>
                </div>
              </template>

              <b-table
                :items="categories"
                :fields="categoryFields"
                striped
                hover
                responsive
              >
                <template #cell(actions)="data">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    class="mr-2"
                    @click="editCategory(data.item)"
                  >
                    Modifier
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-danger"
                    @click="confirmDeleteCategory(data.item)"
                  >
                    Supprimer
                  </b-button>
                </template>
              </b-table>
            </b-card>
          </b-tab>

          <b-tab title="Discussions">
            <b-card>
              <template #header>
                <h3 class="mb-0">Gestion des discussions</h3>
              </template>

              <b-table
                :items="discussions"
                :fields="discussionFields"
                striped
                hover
                responsive
              >
                <template #cell(actions)="data">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    class="mr-2"
                    @click="editDiscussion(data.item)"
                  >
                    Modifier
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-danger"
                    @click="confirmDeleteDiscussion(data.item)"
                  >
                    Supprimer
                  </b-button>
                </template>
              </b-table>
            </b-card>
          </b-tab>

          <b-tab title="Signalements">
            <b-card>
              <template #header>
                <h3 class="mb-0">Gestion des signalements</h3>
              </template>

              <div v-if="reports.length === 0" class="text-center p-4">
                <p>Aucun signalement pour le moment.</p>
              </div>

              <b-table
                v-else
                :items="reports"
                :fields="reportFields"
                striped
                hover
                responsive
              >
                <template #cell(actions)="data">
                  <b-button
                    size="sm"
                    variant="outline-primary"
                    class="mr-2"
                    @click="viewReportedContent(data.item)"
                  >
                    Voir
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-danger"
                    @click="deleteReportedContent(data.item)"
                  >
                    Supprimer contenu
                  </b-button>
                  <b-button
                    size="sm"
                    variant="outline-secondary"
                    @click="dismissReport(data.item)"
                  >
                    Ignorer
                  </b-button>
                </template>
              </b-table>
            </b-card>
          </b-tab>
        </b-tabs>
      </div>

      <!-- Modale pour nouvelle catégorie -->
      <b-modal
        v-model="showNewCategoryModal"
        :title="
          editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'
        "
        @ok="saveCategory"
      >
        <b-form>
          <b-form-group label="Nom de la catégorie:" label-for="category-name">
            <b-form-input
              id="category-name"
              v-model="categoryName"
              placeholder="Nom de la catégorie"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Description:" label-for="category-description">
            <b-form-textarea
              id="category-description"
              v-model="categoryDescription"
              placeholder="Description de la catégorie"
              rows="3"
            ></b-form-textarea>
          </b-form-group>
        </b-form>
      </b-modal>

      <!-- Modale de confirmation de suppression de catégorie -->
      <b-modal
        v-model="showDeleteModal"
        title="Confirmer la suppression"
        @ok="deleteCategory"
      >
        <p>
          Êtes-vous sûr de vouloir supprimer cette catégorie? Toutes les
          discussions associées seront également supprimées.
        </p>
      </b-modal>

      <!-- Modale de modification de discussion -->
      <b-modal
        v-model="showEditDiscussionModal"
        title="Modifier la discussion"
        @ok="saveDiscussion"
      >
        <b-form>
          <b-form-group label="Titre:" label-for="discussion-title">
            <b-form-input
              id="discussion-title"
              v-model="discussionTitle"
              required
            ></b-form-input>
          </b-form-group>
          <b-form-group label="Contenu:" label-for="discussion-content">
            <b-form-textarea
              id="discussion-content"
              v-model="discussionContent"
              rows="4"
            ></b-form-textarea>
          </b-form-group>
        </b-form>
      </b-modal>

      <!-- Modale de confirmation de suppression de discussion -->
      <b-modal
        v-model="showDeleteDiscussionModal"
        title="Supprimer la discussion"
        @ok="deleteDiscussion"
      >
        <p>Êtes-vous sûr de vouloir supprimer cette discussion ?</p>
      </b-modal>
    </b-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "AdminAdmin",
  setup() {
    const router = useRouter();
    const { user } = useAuth();

    const usersStore = useFirestore("users");
    const categoriesStore = useFirestore("categories");
    const reportsStore = useFirestore("reports");
    const discussionsStore = useFirestore("discussions");
    const { addNotification } = useNotification();

    const users = ref([]);
    const categories = ref([]);
    const reports = ref([]);
    const discussions = ref([]);
    const isPending = ref(false);

    const showNewCategoryModal = ref(false);
    const showDeleteModal = ref(false);
    const categoryName = ref("");
    const categoryDescription = ref("");
    const editingCategory = ref(null);
    const categoryToDelete = ref(null);

    const showEditDiscussionModal = ref(false);
    const showDeleteDiscussionModal = ref(false);
    const editingDiscussion = ref(null);
    const discussionToDelete = ref(null);
    const discussionTitle = ref("");
    const discussionContent = ref("");

    const isAdmin = computed(() => {
      if (!user.value) return false;
      return user.value.email === "admin@example.com";
    });

    const userFields = [
      { key: "displayName", label: "Nom" },
      { key: "email", label: "Email" },
      { key: "createdAt", label: "Date d'inscription", formatter: formatDate },
      {
        key: "isAdmin",
        label: "Admin",
        formatter: (val) => (val ? "Oui" : "Non"),
      },
      { key: "actions", label: "Actions" },
    ];

    const categoryFields = [
      { key: "name", label: "Nom" },
      { key: "description", label: "Description" },
      { key: "discussionCount", label: "Discussions" },
      { key: "actions", label: "Actions" },
    ];

    const discussionFields = [
      { key: "title", label: "Titre" },
      { key: "author", label: "Auteur" },
      { key: "createdAt", label: "Date", formatter: formatDate },
      { key: "actions", label: "Actions" },
    ];

    const reportFields = [
      { key: "type", label: "Type" },
      { key: "reason", label: "Raison" },
      { key: "reportedBy", label: "Signalé par" },
      { key: "createdAt", label: "Date", formatter: formatDate },
      { key: "actions", label: "Actions" },
    ];

    function formatDate(value) {
      if (!value) return "";
      const date = value.toDate ? value.toDate() : new Date(value);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    }

    const loadUsers = async () => {
      users.value = await usersStore.getDocuments();
    };

    const loadCategories = async () => {
      categories.value = await categoriesStore.getDocuments();
    };

    const loadReports = async () => {
      reports.value = await reportsStore.getDocuments([], {
        field: "createdAt",
        direction: "desc",
      });
    };

    const loadDiscussions = async () => {
      discussions.value = await discussionsStore.getDocuments();
    };

    const toggleUserRole = async (user) => {
      await usersStore.updateDocument(user.id, { isAdmin: !user.isAdmin });
      addNotification(`Rôle de ${user.displayName} mis à jour`, "success");
      loadUsers();
    };

    const editCategory = (category) => {
      editingCategory.value = category;
      categoryName.value = category.name;
      categoryDescription.value = category.description || "";
      showNewCategoryModal.value = true;
    };

    const saveCategory = async () => {
      if (!categoryName.value.trim()) return;

      if (editingCategory.value) {
        await categoriesStore.updateDocument(editingCategory.value.id, {
          name: categoryName.value,
          description: categoryDescription.value,
        });
        addNotification("Catégorie mise à jour", "success");
      } else {
        await categoriesStore.addDocument({
          name: categoryName.value,
          description: categoryDescription.value,
        });
        addNotification("Catégorie créée", "success");
      }

      categoryName.value = "";
      categoryDescription.value = "";
      editingCategory.value = null;
      loadCategories();
    };

    const confirmDeleteCategory = (category) => {
      categoryToDelete.value = category;
      showDeleteModal.value = true;
    };

    const deleteCategory = async () => {
      if (!categoryToDelete.value) return;
      await categoriesStore.deleteDocument(categoryToDelete.value.id);
      addNotification("Catégorie supprimée", "success");
      loadCategories();
    };

    const viewReportedContent = (report) => {
      if (report.type === "discussion")
        router.push(`/discussion/${report.contentId}`);
      else if (report.type === "response")
        router.push(`/discussion/${report.discussionId}`);
    };

    const deleteReportedContent = async (report) => {
      if (report.type === "discussion") {
        await discussionsStore.deleteDocument(report.contentId);
      } else if (report.type === "response") {
        const responsesStore = useFirestore("responses");
        await responsesStore.deleteDocument(report.contentId);
      }
      await reportsStore.deleteDocument(report.id);
      addNotification("Contenu supprimé", "success");
      loadReports();
    };

    const dismissReport = async (report) => {
      await reportsStore.deleteDocument(report.id);
      addNotification("Signalement ignoré", "success");
      loadReports();
    };

    const editDiscussion = (discussion) => {
      editingDiscussion.value = discussion;
      discussionTitle.value = discussion.title;
      discussionContent.value = discussion.content || "";
      showEditDiscussionModal.value = true;
    };

    const saveDiscussion = async () => {
      if (!discussionTitle.value.trim()) return;
      await discussionsStore.updateDocument(editingDiscussion.value.id, {
        title: discussionTitle.value,
        content: discussionContent.value,
      });
      showEditDiscussionModal.value = false;
      editingDiscussion.value = null;
      loadDiscussions();
      addNotification("Discussion mise à jour", "success");
    };

    const confirmDeleteDiscussion = (discussion) => {
      discussionToDelete.value = discussion;
      showDeleteDiscussionModal.value = true;
    };

    const deleteDiscussion = async () => {
      if (!discussionToDelete.value) return;
      await discussionsStore.deleteDocument(discussionToDelete.value.id);
      showDeleteDiscussionModal.value = false;
      discussionToDelete.value = null;
      loadDiscussions();
      addNotification("Discussion supprimée", "success");
    };

    onMounted(async () => {
      if (!user.value) return router.push("/login");
      isPending.value = true;
      await Promise.all([
        loadUsers(),
        loadCategories(),
        loadReports(),
        loadDiscussions(),
      ]);
      isPending.value = false;
    });

    return {
      user,
      users,
      categories,
      reports,
      discussions,
      isPending,
      isAdmin,
      userFields,
      categoryFields,
      reportFields,
      discussionFields,
      showNewCategoryModal,
      showDeleteModal,
      categoryName,
      categoryDescription,
      editingCategory,
      toggleUserRole,
      editCategory,
      saveCategory,
      confirmDeleteCategory,
      deleteCategory,
      viewReportedContent,
      deleteReportedContent,
      dismissReport,
      editDiscussion,
      saveDiscussion,
      confirmDeleteDiscussion,
      deleteDiscussion,
      showEditDiscussionModal,
      showDeleteDiscussionModal,
      discussionTitle,
      discussionContent,
    };
  },
};
</script>
