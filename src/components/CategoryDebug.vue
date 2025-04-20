<template>
  <div class="category-debug">
    <h2>Débogage des catégories</h2>

    <div class="mb-4">
      <b-button @click="listCategories" variant="info" class="mr-2">
        Lister les catégories
      </b-button>
      <b-button @click="createCategory" variant="success" class="mr-2">
        Créer une catégorie de test
      </b-button>
      <b-button @click="confirmDeleteAll" variant="danger">
        Supprimer toutes les catégories
      </b-button>
    </div>

    <b-alert v-if="message" :variant="messageType" show dismissible>
      {{ message }}
    </b-alert>

    <div v-if="loading" class="text-center my-4">
      <b-spinner variant="primary"></b-spinner>
      <p>Chargement...</p>
    </div>

    <div v-if="categories.length > 0" class="mt-4">
      <h3>Catégories trouvées ({{ categories.length }}):</h3>
      <b-list-group>
        <b-list-group-item v-for="category in categories" :key="category.id">
          <strong>{{ category.name }}</strong>
          <div>
            <small>ID: {{ category.id }}</small>
          </div>
          <div v-if="category.description">{{ category.description }}</div>
        </b-list-group-item>
      </b-list-group>
    </div>

    <div v-else-if="!loading && hasSearched" class="mt-4">
      <p>Aucune catégorie trouvée dans la base de données.</p>
    </div>

    <b-modal
      v-model="showDeleteModal"
      title="Confirmation"
      @ok="deleteAllCategories"
    >
      <p class="my-4">
        Êtes-vous sûr de vouloir supprimer toutes les catégories? Cette action
        est irréversible.
      </p>
    </b-modal>
  </div>
</template>

<script>
import { ref } from "vue";
import {
  listAllCategories,
  createTestCategory,
} from "@/utils/debug-categories";

export default {
  name: "CategoryDebug",
  setup() {
    const categories = ref([]);
    const loading = ref(false);
    const message = ref("");
    const messageType = ref("info");
    const showDeleteModal = ref(false);
    const hasSearched = ref(false);

    const listCategories = async () => {
      loading.value = true;
      message.value = "";

      try {
        const result = await listAllCategories();
        categories.value = result;
        hasSearched.value = true;

        if (result.length === 0) {
          message.value = "Aucune catégorie trouvée dans la base de données.";
          messageType.value = "warning";
        } else {
          message.value = `${result.length} catégorie(s) trouvée(s).`;
          messageType.value = "success";
        }
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      } finally {
        loading.value = false;
      }
    };

    const createCategory = async () => {
      loading.value = true;
      message.value = "";

      try {
        const categoryId = await createTestCategory();

        if (categoryId) {
          message.value = `Catégorie de test créée avec succès. ID: ${categoryId}`;
          messageType.value = "success";
          // Rafraîchir la liste
          listCategories();
        } else {
          message.value = "Échec de la création de la catégorie de test.";
          messageType.value = "danger";
        }
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      } finally {
        loading.value = false;
      }
    };

    const confirmDeleteAll = () => {
      showDeleteModal.value = true;
    };

    const deleteAllCategories = async () => {
      loading.value = true;
      message.value = "";

      try {
        await deleteAllCategories();
        message.value = "Toutes les catégories ont été supprimées.";
        messageType.value = "success";
        categories.value = [];
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      } finally {
        loading.value = false;
      }
    };

    return {
      categories,
      loading,
      message,
      messageType,
      showDeleteModal,
      hasSearched,
      listCategories,
      createCategory,
      confirmDeleteAll,
      deleteAllCategories,
    };
  },
};
</script>
