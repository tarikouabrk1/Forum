import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import {
  BootstrapVue3,
  BContainer,
  BTable,
  BModal,
  BSpinner,
  BAlert,
  BButton,
  BCard,
  BForm,
  BFormGroup,
  BFormInput,
  BFormTextarea,
  BRow,
  BCol,
  BTabs,
  BTab,
} from "bootstrap-vue-3";

// Import Bootstrap and BootstrapVue CSS files
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BIconPlugin } from "bootstrap-vue-3";

// Import Firebase auth for onAuthStateChanged
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

// Import categories initialization
import { initCategories } from "./utils/init-categories";

// Declare app variable before onAuthStateChanged
let app;

onAuthStateChanged(auth, () => {
  if (!app) {
    // Initialize categories
    initCategories()
      .then(() => {
        console.log("Vérification des catégories terminée");
      })
      .catch((error) => {
        console.error("Erreur lors de la vérification des catégories:", error);
      });

    // Initialize Vue app here after Firebase Auth
    app = createApp(App);

    // Register components globally before mounting the app
    app.component("BContainer", BContainer);
    app.component("BTable", BTable);
    app.component("BModal", BModal);
    app.component("BSpinner", BSpinner);
    app.component("BAlert", BAlert);
    app.component("BButton", BButton);
    app.component("BCard", BCard);
    app.component("BForm", BForm);
    app.component("BFormGroup", BFormGroup);
    app.component("BFormInput", BFormInput);
    app.component("BFormTextarea", BFormTextarea);
    app.component("BRow", BRow);
    app.component("BCol", BCol);
    app.component("BTabs", BTabs);
    app.component("BTab", BTab);

    // Use router and BootstrapVue3
    app.use(router);
    app.use(BootstrapVue3);

    // Utiliser le plugin d'icônes pour enregistrer tous les composants d'icônes
    app.use(BIconPlugin);

    // Mount the app
    app.mount("#app");
  }
});
