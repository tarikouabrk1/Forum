<template>
  <div class="login">
    <b-container>
      <b-row class="justify-content-center">
        <b-col md="6">
          <b-card class="mt-5">
            <template #header>
              <h2 class="mb-0">Connexion</h2>
            </template>

            <auth-form :is-register="false" @auth-success="redirectToHome" />

            <div class="mt-3 text-center">
              <p>
                Vous n'avez pas de compte?
                <router-link to="/register">S'inscrire</router-link>
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
  name: "LoginLogin",
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
