<template>
  <div class="new-response-form mt-4">
    <h4>Ajouter une réponse</h4>

    <div v-if="!user" class="text-center p-4 border rounded">
      <p>Vous devez être connecté pour répondre à cette discussion.</p>
      <b-button to="/login" variant="primary">Se connecter</b-button>
    </div>

    <b-form v-else @submit.prevent="handleSubmit">
      <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

      <b-form-group>
        <b-form-textarea
          v-model="content"
          placeholder="Votre réponse..."
          rows="5"
          required
        ></b-form-textarea>
      </b-form-group>

      <div class="d-flex justify-content-end">
        <b-button type="submit" variant="primary" :disabled="isPending">
          Répondre
        </b-button>
      </div>
    </b-form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "NewResponseForm",
  props: {
    discussionId: {
      type: String,
      required: true,
    },
  },
  emits: ["response-added"],
  setup(props, { emit }) {
    console.log(
      "NewResponseForm initialisé avec discussionId:",
      props.discussionId
    );

    const { user } = useAuth();
    const {
      addDocument,
      error: firestoreError,
      isPending,
    } = useFirestore("responses");
    const { addNotification } = useNotification();

    const content = ref("");
    const error = ref(null);

    const handleSubmit = async () => {
      console.log("Soumission du formulaire de réponse");

      if (!user.value) {
        error.value = "Vous devez être connecté pour répondre";
        return;
      }

      if (!content.value.trim()) {
        error.value = "Le contenu de la réponse ne peut pas être vide";
        return;
      }

      error.value = null;

      try {
        const responseData = {
          discussionId: props.discussionId,
          content: content.value,
          authorId: user.value.uid,
          authorName: user.value.displayName || "Utilisateur anonyme",
          createdAt: new Date(), // Ajouter explicitement la date de création
        };

        console.log("Données de la réponse:", responseData);

        const docRef = await addDocument(responseData);
        console.log("Réponse ajoutée avec ID:", docRef.id);

        content.value = "";
        addNotification("Réponse ajoutée avec succès", "success");
        emit("response-added");
      } catch (err) {
        console.error("Erreur lors de l'ajout de la réponse:", err);
        error.value = firestoreError.value || err.message;
      }
    };

    onMounted(() => {
      console.log(
        "NewResponseForm monté avec discussionId:",
        props.discussionId
      );
    });

    return {
      user,
      content,
      error,
      isPending,
      handleSubmit, // Exposer l'ID pour le débogage dans le template
    };
  },
};
</script>
