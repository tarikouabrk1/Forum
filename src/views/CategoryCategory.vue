<template>
  <div class="category">
    <b-container>
      <div v-if="isPending" class="text-center p-5">
        <b-spinner variant="primary" label="Chargement..."></b-spinner>
      </div>

      <div v-else-if="error" class="text-center p-5">
        <b-alert show variant="danger">{{ error }}</b-alert>
        <b-button to="/" variant="primary" class="mt-3"
          >Retour à l'accueil</b-button
        >
      </div>

      <div v-else>
        <b-breadcrumb :items="breadcrumbItems"></b-breadcrumb>

        <div class="category-header mb-4">
          <h1>{{ category.name }}</h1>
          <p v-if="category.description" class="lead">
            {{ category.description }}
          </p>
        </div>

        <discussion-list
          :title="`Discussions dans ${category.name}`"
          :category-id="id"
        />
      </div>
    </b-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import useFirestore from "@/composables/useFirestore";
import DiscussionList from "@/components/DiscussionList.vue";

export default {
  name: "CategoryCategory",
  components: {
    DiscussionList,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const {
      getDocument,
      error: firestoreError,
      isPending,
    } = useFirestore("categories");

    const category = ref({});
    const error = ref(null);

    const breadcrumbItems = computed(() => [
      { text: "Accueil", to: "/" },
      { text: category.value.name || "Catégorie", active: true },
    ]);

    const loadCategory = async () => {
      try {
        const doc = await getDocument(props.id);

        if (doc) {
          category.value = doc;
        } else {
          error.value = "Catégorie non trouvée";
        }

        if (firestoreError.value) {
          error.value = firestoreError.value;
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    onMounted(() => {
      loadCategory();
    });

    return {
      category,
      error,
      isPending,
      breadcrumbItems,
    };
  },
};
</script>
