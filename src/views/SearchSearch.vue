<template>
  <div class="search">
    <b-container>
      <h1 class="mb-4">Résultats de recherche</h1>

      <b-form @submit.prevent="search" class="mb-4">
        <b-input-group>
          <b-form-input
            v-model="searchQuery"
            placeholder="Rechercher des discussions..."
            required
          ></b-form-input>
          <b-input-group-append>
            <b-button type="submit" variant="primary" :disabled="isPending">
              <b-icon icon="search"></b-icon> Rechercher
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>

      <div v-if="isPending" class="text-center p-5">
        <b-spinner variant="primary" label="Chargement..."></b-spinner>
      </div>

      <div v-else-if="error" class="text-center p-5">
        <b-alert show variant="danger">{{ error }}</b-alert>
      </div>

      <div v-else>
        <div v-if="hasSearched">
          <h2>{{ results.length }} résultat(s) pour "{{ lastSearchQuery }}"</h2>

          <div v-if="results.length === 0" class="text-center p-5">
            <p>Aucun résultat trouvé pour votre recherche.</p>
            <b-button to="/" variant="primary">Retour à l'accueil</b-button>
          </div>

          <div v-else>
            <discussion-item
              v-for="discussion in results"
              :key="discussion.id"
              :discussion="discussion"
            />
          </div>
        </div>

        <div v-else class="text-center p-5">
          <p>
            Utilisez la barre de recherche ci-dessus pour trouver des
            discussions.
          </p>
        </div>
      </div>
    </b-container>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import useFirestore from "@/composables/useFirestore";
import DiscussionItem from "@/components/DiscussionItem.vue";

export default {
  name: "SearchSearch",
  components: {
    DiscussionItem,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const {
      getDocuments,
      error: firestoreError,
      isPending,
    } = useFirestore("discussions");

    const searchQuery = ref("");
    const lastSearchQuery = ref("");
    const results = ref([]);
    const error = ref(null);
    const hasSearched = ref(false);

    const search = async () => {
      if (!searchQuery.value.trim()) return;

      error.value = null;
      lastSearchQuery.value = searchQuery.value;
      hasSearched.value = true;

      try {
        // Mettre à jour l'URL avec la requête de recherche
        router.push({ path: "/search", query: { q: searchQuery.value } });

        // Récupérer toutes les discussions (dans une application réelle, vous utiliseriez
        // une fonction de recherche côté serveur ou un index de recherche comme Algolia)
        const allDiscussions = await getDocuments();

        // Filtrer les discussions qui contiennent la requête de recherche dans le titre ou le contenu
        const query = searchQuery.value.toLowerCase();
        results.value = allDiscussions.filter((discussion) => {
          return (
            discussion.title.toLowerCase().includes(query) ||
            discussion.content.toLowerCase().includes(query)
          );
        });

        if (firestoreError.value) {
          error.value = firestoreError.value;
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    const searchFromQuery = () => {
      const query = route.query.q;
      if (query) {
        searchQuery.value = query;
        search();
      }
    };

    onMounted(() => {
      searchFromQuery();
    });

    return {
      searchQuery,
      lastSearchQuery,
      results,
      error,
      isPending,
      hasSearched,
      search,
    };
  },
};
</script>
