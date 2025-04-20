<template>
  <div class="new-discussion-form">
    <h2>{{ isEditing ? "Modifier la discussion" : "Nouvelle discussion" }}</h2>

    <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

    <div v-if="loadingCategories" class="text-center my-4">
      <b-spinner
        variant="primary"
        label="Chargement des catégories..."
      ></b-spinner>
      <p class="mt-2">Chargement des catégories...</p>
    </div>

    <b-form v-else @submit.prevent="handleSubmit">
      <b-form-group label="Titre:" label-for="title">
        <b-form-input
          id="title"
          v-model="title"
          placeholder="Titre de la discussion"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Catégorie:" label-for="category">
        <b-form-select
          id="category"
          v-model="categoryId"
          :options="categoryOptions"
          required
        ></b-form-select>

        <div v-if="categories.length === 0" class="text-danger mt-2">
          <small
            >Aucune catégorie disponible. Veuillez contacter un
            administrateur.</small
          >
        </div>
      </b-form-group>

      <b-form-group label="Contenu:" label-for="content">
        <b-form-textarea
          id="content"
          v-model="content"
          placeholder="Contenu de la discussion"
          rows="10"
          required
        ></b-form-textarea>
      </b-form-group>

      <div class="d-flex justify-content-between">
        <b-button type="button" variant="secondary" @click="cancel"
          >Annuler</b-button
        >
        <b-button
          type="submit"
          variant="primary"
          :disabled="isPending || categories.length === 0"
        >
          {{ isEditing ? "Mettre à jour" : "Créer la discussion" }}
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "NewDiscussionForm",
  props: {
    discussionId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const router = useRouter();
    const { user } = useAuth();
    const {
      addDocument,
      updateDocument,
      getDocument,
      error: firestoreError,
      isPending,
    } = useFirestore("discussions");
    const categoriesStore = useFirestore("categories");
    const { addNotification } = useNotification();

    const title = ref("");
    const content = ref("");
    const categoryId = ref("");
    const categories = ref([]);
    const error = ref(null);
    const loadingCategories = ref(true);

    const isEditing = computed(() => !!props.discussionId);

    const categoryOptions = computed(() => {
      if (categories.value.length === 0) {
        return [{ value: "", text: "Aucune catégorie disponible" }];
      }

      const options = [{ value: "", text: "Sélectionnez une catégorie" }];
      categories.value.forEach((category) => {
        options.push({ value: category.id, text: category.name });
      });
      return options;
    });

    const loadCategories = async () => {
      try {
        loadingCategories.value = true;
        categories.value = await categoriesStore.getDocuments();

        if (categories.value.length > 0 && !categoryId.value) {
          // Sélectionner la première catégorie par défaut si aucune n'est sélectionnée
          categoryId.value = categories.value[0].id;
        }
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
        error.value = "Erreur lors du chargement des catégories";
      } finally {
        loadingCategories.value = false;
      }
    };

    const loadDiscussion = async () => {
      if (props.discussionId) {
        try {
          const discussion = await getDocument(props.discussionId);
          if (discussion) {
            title.value = discussion.title;
            content.value = discussion.content;
            categoryId.value = discussion.categoryId;

            // Vérifier si l'utilisateur est l'auteur
            if (user.value && user.value.uid !== discussion.authorId) {
              error.value =
                "Vous n'êtes pas autorisé à modifier cette discussion";
              router.push("/discussion/" + props.discussionId);
            }
          } else {
            error.value = "Discussion non trouvée";
            router.push("/");
          }
        } catch (err) {
          error.value = err.message;
        }
      }
    };

    const handleSubmit = async () => {
      if (!user.value) {
        error.value = "Vous devez être connecté pour créer une discussion";
        return;
      }

      if (!title.value.trim() || !content.value.trim() || !categoryId.value) {
        error.value = "Veuillez remplir tous les champs";
        return;
      }

      error.value = null;

      try {
        const discussionData = {
          title: title.value,
          content: content.value,
          categoryId: categoryId.value,
          authorId: user.value.uid,
          authorName: user.value.displayName || "Utilisateur anonyme",
          responseCount: 0,
        };

        if (isEditing.value) {
          await updateDocument(props.discussionId, {
            ...discussionData,
            updatedAt: new Date(), // ✅ add updatedAt for edits
          });
          addNotification("Discussion mise à jour avec succès", "success");
          router.push("/discussion/" + props.discussionId);
        } else {
          const docRef = await addDocument({
            ...discussionData,
            createdAt: new Date(), // ✅ add createdAt for new discussions
          });
          addNotification("Discussion créée avec succès", "success");
          router.push("/discussion/" + docRef.id);
        }
      } catch (err) {
        error.value = firestoreError.value || err.message;
      }
    };

    const cancel = () => {
      if (isEditing.value) {
        router.push("/discussion/" + props.discussionId);
      } else {
        router.push("/");
      }
    };

    onMounted(() => {
      loadCategories();
      if (props.discussionId) {
        loadDiscussion();
      }
    });

    return {
      title,
      content,
      categoryId,
      categories,
      error,
      isPending,
      isEditing,
      loadingCategories,
      categoryOptions,
      handleSubmit,
      cancel,
    };
  },
};
</script>
