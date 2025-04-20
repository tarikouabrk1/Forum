<template>
  <div class="register">
    <b-container>
      <b-row class="justify-content-center">
        <b-col md="6">
          <b-card class="mt-5">
            <template #header>
              <h2 class="mb-0">Inscription</h2>
            </template>

            <auth-form :is-register="true" @auth-success="redirectToHome" />

            <div class="mt-3 text-center">
              <p>
                Vous avez déjà un compte?
                <router-link to="/login">Se connecter</router-link>
              </p>
            </div>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script>
import { useRouter } from "vue-router";
import AuthForm from "@/components/AuthForm.vue";

export default {
  name: "RegisterRegister",
  components: {
    AuthForm,
  },
  setup() {
    const router = useRouter();

    const redirectToHome = () => {
      router.push("/");
    };

    return {
      redirectToHome,
    };
  },
};
</script>
