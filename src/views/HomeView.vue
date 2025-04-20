<template>
  <div class="home">
    <b-container>
      <b-row class="mb-4">
        <b-col>
          <h1>Forum Communautaire</h1>
          <p class="lead">
            Bienvenue sur notre forum communautaire. Discutez, posez des
            questions et partagez vos idées.
          </p>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="8">
          <discussion-list title="Discussions récentes" />
        </b-col>

        <b-col md="4">
          <b-card class="mb-4">
            <template #header>
              <h4 class="mb-0">Catégories</h4>
            </template>

            <b-list-group flush>
              <b-list-group-item
                v-for="category in categories"
                :key="category.id"
                :to="`/category/${category.id}`"
                class="d-flex justify-content-between align-items-center"
              >
                {{ category.name }}
                <b-badge variant="primary" pill>{{
                  category.discussionCount || 0
                }}</b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-card>

          <b-card>
            <template #header>
              <h4 class="mb-0">Statistiques</h4>
            </template>

            <b-list-group flush>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                Discussions
                <b-badge variant="primary" pill>{{
                  stats.discussionCount
                }}</b-badge>
              </b-list-group-item>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                Réponses
                <b-badge variant="primary" pill>{{
                  stats.responseCount
                }}</b-badge>
              </b-list-group-item>
              <b-list-group-item
                class="d-flex justify-content-between align-items-center"
              >
                Utilisateurs
                <b-badge variant="primary" pill>{{ stats.userCount }}</b-badge>
              </b-list-group-item>
            </b-list-group>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import DiscussionList from "@/components/DiscussionList.vue";
import useFirestore from "@/composables/useFirestore";

export default {
  name: "HomeView",
  components: {
    DiscussionList,
  },
  setup() {
    const categoriesStore = useFirestore("categories");
    const discussionsStore = useFirestore("discussions");
    const responsesStore = useFirestore("responses");
    const usersStore = useFirestore("users");

    const categories = ref([]);
    const stats = ref({
      discussionCount: 0,
      responseCount: 0,
      userCount: 0,
    });

    const loadCategories = async () => {
      try {
        categories.value = await categoriesStore.getDocuments();

        // Charger le nombre de discussions par catégorie
        for (const category of categories.value) {
          const discussions = await discussionsStore.getDocuments([
            {
              field: "categoryId",
              operator: "==",
              value: category.id,
            },
          ]);

          category.discussionCount = discussions.length;
        }
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };

    const loadStats = async () => {
      try {
        const discussions = await discussionsStore.getDocuments();
        const responses = await responsesStore.getDocuments();
        const users = await usersStore.getDocuments();

        stats.value = {
          discussionCount: discussions.length,
          responseCount: responses.length,
          userCount: users.length,
        };
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };

    onMounted(() => {
      loadCategories();
      loadStats();
    });

    return {
      categories,
      stats,
    };
  },
};
</script>
