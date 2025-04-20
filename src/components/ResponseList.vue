<template>
  <div class="response-list">
    <h3>{{ responses.length }} Réponses</h3>

    <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

    <div v-if="isPending" class="text-center p-4">
      <b-spinner variant="primary" label="Chargement..."></b-spinner>
    </div>

    <div v-else-if="responses.length === 0" class="text-center p-4">
      <p>Aucune réponse pour le moment. Soyez le premier à répondre!</p>
    </div>

    <div v-else>
      <response-item
        v-for="response in responses"
        :key="response.id"
        :response="response"
        @deleted="loadResponses"
      />
    </div>

    <new-response-form
      :discussion-id="discussionId"
      @response-added="loadResponses"
    />
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import useFirestore from "@/composables/useFirestore";
import ResponseItem from "@/components/ResponseItem.vue";
import NewResponseForm from "@/components/NewResponseForm.vue";

export default {
  name: "ResponseList",
  components: {
    ResponseItem,
    NewResponseForm,
  },
  props: {
    discussionId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const {
      getDocuments,
      error: firestoreError,
      isPending,
    } = useFirestore("responses");
    const discussionsStore = useFirestore("discussions");

    const responses = ref([]);
    const error = ref(null);

    const loadResponses = async () => {
      console.log(
        "Chargement des réponses pour la discussion:",
        props.discussionId
      );

      try {
        const conditions = [
          {
            field: "discussionId",
            operator: "==",
            value: props.discussionId,
          },
        ];

        console.log("Conditions de recherche:", conditions);

        const result = await getDocuments(conditions, {
          field: "createdAt",
          direction: "asc",
        });

        console.log("Réponses récupérées:", result);
        responses.value = result;

        // Mettre à jour le nombre de réponses dans la discussion
        if (props.discussionId) {
          await discussionsStore.updateDocument(props.discussionId, {
            responseCount: responses.value.length,
          });
        }

        if (firestoreError.value) {
          console.error("Erreur Firestore:", firestoreError.value);
          error.value = firestoreError.value;
        }
      } catch (err) {
        console.error("Erreur lors du chargement des réponses:", err);
        error.value = err.message;
      }
    };

    onMounted(() => {
      console.log("ResponseList monté avec discussionId:", props.discussionId);
      if (props.discussionId) {
        loadResponses();
      } else {
        console.error("Aucun ID de discussion fourni");
      }
    });

    // Ajouter un watcher pour recharger les réponses si l'ID change
    watch(
      () => props.discussionId,
      (newId, oldId) => {
        console.log("ID de discussion changé:", oldId, "->", newId);
        if (newId && newId !== oldId) {
          loadResponses();
        }
      }
    );

    return {
      responses,
      error,
      isPending,
      loadResponses,
    };
  },
};
</script>
