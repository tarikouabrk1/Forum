<template>
  <div class="discussion-list">
    <h2>{{ title }}</h2>

    <div class="filters mb-4">
      <b-form-group label="Filtrer par:">
        <b-form-select
          v-model="selectedCategory"
          :options="categoryOptions"
        ></b-form-select>
      </b-form-group>

      <b-form-group label="Trier par:">
        <b-form-select v-model="sortBy" :options="sortOptions"></b-form-select>
      </b-form-group>
    </div>

    <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

    <b-card v-if="isPending" class="text-center p-4">
      <b-spinner variant="primary" label="Chargement..."></b-spinner>
    </b-card>

    <div v-else-if="discussions.length === 0" class="text-center p-4">
      <p>Aucune discussion trouvée.</p>
      <b-button to="/new-discussion" variant="primary"
        >Créer une nouvelle discussion</b-button
      >
    </div>

    <div v-else>
      <discussion-item
        v-for="discussion in filteredDiscussions"
        :key="discussion.id"
        :discussion="discussion"
      />

      <div class="mt-4 text-center">
        <b-button to="/new-discussion" variant="primary"
          >Créer une nouvelle discussion</b-button
        >
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import useFirestore from "@/composables/useFirestore";
import DiscussionItem from "@/components/DiscussionItem.vue";

export default {
  name: "DiscussionList",
  components: {
    DiscussionItem,
  },
  props: {
    title: {
      type: String,
      default: "Discussions",
    },
    categoryId: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const {
      getDocuments,
      error: firestoreError,
      isPending,
    } = useFirestore("discussions");
    const categoriesStore = useFirestore("categories");

    const discussions = ref([]);
    const categories = ref([]);
    const error = ref(null);
    const selectedCategory = ref(props.categoryId || "");
    const sortBy = ref("newest");

    const categoryOptions = computed(() => {
      const options = [{ value: "", text: "Toutes les catégories" }];
      categories.value.forEach((category) => {
        options.push({ value: category.id, text: category.name });
      });
      return options;
    });

    const sortOptions = computed(() => [
      { value: "newest", text: "Plus récentes" },
      { value: "oldest", text: "Plus anciennes" },
      { value: "popular", text: "Plus populaires" },
    ]);

    const filteredDiscussions = computed(() => {
      let result = [...discussions.value];

      // Filtrer par catégorie
      if (selectedCategory.value) {
        result = result.filter(
          (discussion) => discussion.categoryId === selectedCategory.value
        );
      }

      // Trier
      if (sortBy.value === "newest") {
        result.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      } else if (sortBy.value === "oldest") {
        result.sort((a, b) => a.createdAt?.seconds - b.createdAt?.seconds);
      } else if (sortBy.value === "popular") {
        result.sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0));
      }

      return result;
    });

    const loadDiscussions = async () => {
      try {
        let conditions = [];

        if (props.categoryId) {
          conditions.push({
            field: "categoryId",
            operator: "==",
            value: props.categoryId,
          });
          selectedCategory.value = props.categoryId;
        }

        discussions.value = await getDocuments(conditions, {
          field: "createdAt",
          direction: "desc",
        });

        console.log("Discussions chargées :", discussions.value);

        if (firestoreError.value) {
          error.value = firestoreError.value;
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    const loadCategories = async () => {
      try {
        categories.value = await categoriesStore.getDocuments();
      } catch (err) {
        console.error("Erreur lors du chargement des catégories:", err);
      }
    };

    onMounted(() => {
      loadDiscussions();
      loadCategories();
    });

    watch(
      () => props.categoryId,
      () => {
        if (props.categoryId !== selectedCategory.value) {
          selectedCategory.value = props.categoryId || "";
          loadDiscussions();
        }
      }
    );

    return {
      discussions,
      filteredDiscussions,
      error,
      isPending,
      selectedCategory,
      sortBy,
      categoryOptions,
      sortOptions,
    };
  },
};
</script>
