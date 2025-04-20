<template>
  <div class="debug-tools p-3 mt-4 bg-light border rounded">
    <h4>Outils de débogage</h4>

    <div class="mb-3">
      <h5>Informations utilisateur</h5>
      <div v-if="user">
        <p><strong>UID:</strong> {{ user.uid }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Nom:</strong> {{ user.displayName }}</p>
        <p><strong>Admin:</strong> {{ isAdmin ? "Oui" : "Non" }}</p>
        <b-button @click="makeAdmin" variant="warning" size="sm" class="mr-2">
          Définir comme admin
        </b-button>
      </div>
      <div v-else>
        <p>Non connecté</p>
      </div>
    </div>

    <div class="mb-3">
      <h5>Outils de discussion</h5>
      <b-form-group label="ID de discussion:">
        <b-form-input
          v-model="discussionId"
          placeholder="ID de la discussion"
        ></b-form-input>
      </b-form-group>
      <b-button
        @click="addTestResponse"
        variant="primary"
        size="sm"
        class="mr-2"
        :disabled="!discussionId"
      >
        Créer une réponse de test
      </b-button>
      <b-button
        @click="viewDiscussion"
        variant="info"
        size="sm"
        :disabled="!discussionId"
      >
        Voir la discussion
      </b-button>
    </div>

    <div class="mb-3">
      <h5>Outils de catégorie</h5>
      <b-button
        @click="createTestCategory"
        variant="success"
        size="sm"
        class="mr-2"
      >
        Créer une catégorie de test
      </b-button>
      <b-button @click="listCategories" variant="info" size="sm">
        Lister les catégories
      </b-button>
    </div>

    <b-alert v-if="message" :variant="messageType" show dismissible>
      {{ message }}
    </b-alert>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import { createTestResponse as createTestResponseUtil } from "@/utils/create-test-response";
import { createOrUpdateAdminUser } from "@/utils/create-admin-user";

export default {
  name: "DebugTools",
  setup() {
    const router = useRouter();
    const { user } = useAuth();
    const categoriesStore = useFirestore("categories");

    const discussionId = ref("");
    const message = ref("");
    const messageType = ref("info");

    const isAdmin = computed(() => {
      if (!user.value) return false;
      return user.value.email === "admin@example.com"; // À adapter selon votre logique
    });

    // Renommé la méthode pour éviter le conflit
    const addTestResponse = async () => {
      if (!discussionId.value) {
        message.value = "Veuillez entrer un ID de discussion";
        messageType.value = "warning";
        return;
      }

      try {
        const responseId = await createTestResponseUtil(discussionId.value);
        if (responseId) {
          message.value = `Réponse de test créée avec succès. ID: ${responseId}`;
          messageType.value = "success";
        }
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      }
    };

    const viewDiscussion = () => {
      if (discussionId.value) {
        router.push(`/discussion/${discussionId.value}`);
      }
    };

    const createTestCategory = async () => {
      try {
        const categoryData = {
          name: "Catégorie de test",
          description: "Catégorie créée pour le débogage",
          createdAt: new Date(),
        };

        const docRef = await categoriesStore.addDocument(categoryData);
        message.value = `Catégorie de test créée avec succès. ID: ${docRef.id}`;
        messageType.value = "success";
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      }
    };

    const listCategories = async () => {
      try {
        const categories = await categoriesStore.getDocuments();
        message.value = `${categories.length} catégorie(s) trouvée(s)`;
        messageType.value = "info";
        console.log("Catégories:", categories);
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      }
    };

    const makeAdmin = async () => {
      if (!user.value) return;

      try {
        const success = await createOrUpdateAdminUser(
          user.value.uid,
          user.value.email
        );
        if (success) {
          message.value = "Utilisateur défini comme admin avec succès";
          messageType.value = "success";
        }
      } catch (error) {
        message.value = `Erreur: ${error.message}`;
        messageType.value = "danger";
      }
    };

    return {
      user,
      isAdmin,
      discussionId,
      message,
      messageType,
      addTestResponse, // Renommé ici aussi
      viewDiscussion,
      createTestCategory,
      listCategories,
      makeAdmin,
    };
  },
};
</script>
