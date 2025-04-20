<template>
  <div class="auth-form">
    <b-form @submit.prevent="handleSubmit">
      <b-form-group
        v-if="isRegister"
        label="Nom d'utilisateur:"
        label-for="displayName"
      >
        <b-form-input
          id="displayName"
          v-model="displayName"
          type="text"
          placeholder="Entrez votre nom d'utilisateur"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Email:" label-for="email">
        <b-form-input
          id="email"
          v-model="email"
          type="email"
          placeholder="Entrez votre email"
          required
        ></b-form-input>
      </b-form-group>

      <b-form-group label="Mot de passe:" label-for="password">
        <b-form-input
          id="password"
          v-model="password"
          type="password"
          placeholder="Entrez votre mot de passe"
          required
        ></b-form-input>
      </b-form-group>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <b-button type="submit" variant="primary" :disabled="isPending">
          {{ isRegister ? "S'inscrire" : "Se connecter" }}
        </b-button>
        <b-link v-if="!isRegister" @click="showForgotPassword = true"
          >Mot de passe oublié?</b-link
        >
      </div>

      <b-alert v-if="error" show variant="danger">{{ error }}</b-alert>
    </b-form>

    <!-- Modal pour réinitialiser le mot de passe -->
    <b-modal
      v-model="showForgotPassword"
      title="Réinitialiser le mot de passe"
      hide-footer
    >
      <b-form @submit.prevent="handleResetPassword">
        <b-form-group label="Email:" label-for="reset-email">
          <b-form-input
            id="reset-email"
            v-model="resetEmail"
            type="email"
            placeholder="Entrez votre email"
            required
          ></b-form-input>
        </b-form-group>

        <b-button
          type="submit"
          variant="primary"
          class="mt-3"
          :disabled="isPending"
        >
          Envoyer le lien de réinitialisation
        </b-button>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { ref } from "vue";
import useAuth from "@/composables/useAuth";
import useNotification from "@/composables/useNotification";

export default {
  name: "AuthForm",
  props: {
    isRegister: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["auth-success"],
  setup(props, { emit }) {
    const {
      signup,
      login,
      resetPassword,
      error: authError,
      isPending,
    } = useAuth();
    const { addNotification } = useNotification();

    const email = ref("");
    const password = ref("");
    const displayName = ref("");
    const error = ref(null);
    const resetEmail = ref("");
    const showForgotPassword = ref(false);

    const handleSubmit = async () => {
      error.value = null;

      try {
        let res;

        if (props.isRegister) {
          res = await signup(email.value, password.value, displayName.value);
          if (res) {
            addNotification("Compte créé avec succès!", "success");
            emit("auth-success");
          }
        } else {
          res = await login(email.value, password.value);
          if (res) {
            addNotification("Connexion réussie!", "success");
            emit("auth-success");
          }
        }

        if (authError.value) {
          error.value = authError.value;
        }
      } catch (err) {
        error.value = err.message;
      }
    };

    const handleResetPassword = async () => {
      const success = await resetPassword(resetEmail.value);

      if (success) {
        showForgotPassword.value = false;
        addNotification(
          "Un email de réinitialisation a été envoyé à votre adresse email.",
          "success"
        );
        resetEmail.value = "";
      } else {
        error.value = authError.value;
      }
    };

    return {
      email,
      password,
      displayName,
      error,
      isPending,
      resetEmail,
      showForgotPassword,
      handleSubmit,
      handleResetPassword,
    };
  },
};
</script>
