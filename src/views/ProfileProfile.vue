<template>
  <div class="profile">
    <b-container>
      <h1 class="mb-4">Profil utilisateur</h1>

      <div v-if="isPending" class="text-center p-5">
        <b-spinner variant="primary" label="Chargement..."></b-spinner>
      </div>

      <div v-else-if="!user" class="text-center p-5">
        <b-alert show variant="warning"
          >Vous devez être connecté pour accéder à cette page.</b-alert
        >
        <b-button to="/login" variant="primary" class="mt-3"
          >Se connecter</b-button
        >
      </div>

      <div v-else>
        <b-row>
          <b-col md="4">
            <b-card>
              <template #header>
                <h3 class="mb-0">Informations personnelles</h3>
              </template>

              <div class="text-center mb-4">
                <b-avatar
                  :text="getInitials(user.displayName)"
                  size="6rem"
                  variant="primary"
                ></b-avatar>
              </div>

              <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>

              <b-form @submit.prevent="updateProfile">
                <b-form-group
                  label="Nom d'utilisateur:"
                  label-for="displayName"
                >
                  <b-form-input
                    id="displayName"
                    v-model="displayName"
                    placeholder="Nom d'utilisateur"
                    required
                  ></b-form-input>
                </b-form-group>

                <b-form-group label="Email:" label-for="email">
                  <b-form-input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    disabled
                  ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary" :disabled="isPending">
                  Mettre à jour le profil
                </b-button>
              </b-form>
            </b-card>
          </b-col>

          <b-col md="8">
            <b-card>
              <template #header>
                <h3 class="mb-0">Mes discussions</h3>
              </template>

              <div v-if="userDiscussions.length === 0" class="text-center p-4">
                <p>Vous n'avez pas encore créé de discussion.</p>
                <b-button to="/new-discussion" variant="primary"
                  >Créer une discussion</b-button
                >
              </div>

              <b-list-group v-else>
                <b-list-group-item
                  v-for="discussion in userDiscussions"
                  :key="discussion.id"
                  :to="`/discussion/${discussion.id}`"
                  class="d-flex justify-content-between align-items-center"
                >
                  <div>
                    <h5 class="mb-1">{{ discussion.title }}</h5>
                    <small class="text-muted">{{
                      formatDate(discussion.createdAt)
                    }}</small>
                  </div>
                  <b-badge variant="primary" pill
                    >{{ discussion.responseCount || 0 }} réponses</b-badge
                  >
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
        </b-row>
      </div>
    </b-container>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";
import { auth } from "@/firebase/config";
import { updateProfile as updateFirebaseProfile } from "firebase/auth"; // Import and rename Firebase's updateProfile

export default {
  name: "ProfileProfile",
  setup() {
    const router = useRouter();
    const { user } = useAuth();
    const usersStore = useFirestore("users");
    const discussionsStore = useFirestore("discussions");
    const responsesStore = useFirestore("responses");
    const { addNotification } = useNotification();

    const displayName = ref("");
    const email = ref("");
    const error = ref(null);
    const userDiscussions = ref([]);
    const responsesData = ref([]);
    const isPending = ref(false);
    const notification = ref(null);

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    };

    const formatDate = (timestamp) => {
      if (!timestamp) return "Date inconnue";

      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    };

    const loadUserProfile = () => {
      if (user.value) {
        displayName.value = user.value.displayName || "";
        email.value = user.value.email || "";
      }
    };

    // Avoid re-fetching if already fetched
    const loadUserDiscussions = async () => {
      if (user.value && userDiscussions.value.length === 0) {
        try {
          isPending.value = true;
          userDiscussions.value = await discussionsStore.getDocuments(
            [{ field: "authorId", operator: "==", value: user.value.uid }],
            {
              field: "createdAt", // ⬅️ Order by most recent
              direction: "desc",
            }
          );
          isPending.value = false;
        } catch (err) {
          console.error("Erreur lors du chargement des discussions:", err);
          isPending.value = false;
        }
      }
    };

    const loadUserResponses = async () => {
      if (user.value && responsesData.value.length === 0) {
        // Check if already loaded
        try {
          isPending.value = true;
          responsesData.value = await responsesStore.getDocuments(
            [
              {
                field: "authorId",
                operator: "==",
                value: user.value.uid,
              },
            ],
            {
              field: "createdAt",
              direction: "desc",
            }
          );
          isPending.value = false;
        } catch (err) {
          console.error("Erreur lors du chargement des réponses:", err);
          isPending.value = false;
        }
      }
    };

    // Ensure this doesn't cause infinite recursion
    const updateProfile = async () => {
      error.value = null;

      if (!displayName.value.trim()) {
        error.value = "Le nom d'utilisateur ne peut pas être vide";
        return;
      }

      try {
        isPending.value = true;

        // Mettre à jour le profil Firebase Auth (renamed to avoid conflict)
        await updateFirebaseProfile(auth.currentUser, {
          displayName: displayName.value,
        });

        // Update user in Firestore if needed
        const userDocs = await usersStore.getDocuments([
          { field: "uid", operator: "==", value: user.value.uid },
        ]);

        if (userDocs && userDocs.length > 0) {
          // Update existing user document
          await usersStore.updateDocument(userDocs[0].id, {
            displayName: displayName.value,
            updatedAt: new Date(),
          });
        } else {
          // Create new user document
          await usersStore.addDocument({
            uid: user.value.uid,
            displayName: displayName.value,
            email: user.value.email,
            isAdmin: false,
            createdAt: new Date(),
          });
        }

        // Update author name in discussions and responses
        const userDiscussions = await discussionsStore.getDocuments([
          { field: "authorId", operator: "==", value: user.value.uid },
        ]);

        for (const discussion of userDiscussions) {
          await discussionsStore.updateDocument(discussion.id, {
            authorName: displayName.value,
          });
        }

        const userResponses = await responsesStore.getDocuments([
          { field: "authorId", operator: "==", value: user.value.uid },
        ]);

        for (const response of userResponses) {
          await responsesStore.updateDocument(response.id, {
            authorName: displayName.value,
          });
        }

        isPending.value = false;
        notification.value = "Profil mis à jour avec succès";
        addNotification(notification.value, "success");
      } catch (err) {
        isPending.value = false;
        error.value = err.message;
        console.error("Erreur lors de la mise à jour du profil:", err);
      }
    };

    onMounted(() => {
      if (!user.value) {
        router.push("/login");
        return;
      }

      loadUserProfile();
      loadUserDiscussions();
      loadUserResponses();
    });

    return {
      user,
      displayName,
      email,
      error,
      isPending,
      userDiscussions,
      responsesData,
      getInitials,
      formatDate,
      updateProfile,
      notification,
    };
  },
};
</script>
