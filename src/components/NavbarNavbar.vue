<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <b-navbar-brand to="/" class="font-weight-bold"
        >Forum Communautaire</b-navbar-brand
      >

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="mr-auto">
          <b-nav-item to="/" class="nav-link">Accueil</b-nav-item>

          <b-nav-form class="d-flex align-items-center">
            <b-form-input
              size="sm"
              class="mr-sm-2 search-input"
              placeholder="Rechercher..."
              v-model="searchQuery"
              @keyup.enter="search"
            ></b-form-input>
            <b-button
              size="sm"
              class="my-2 my-sm-0 search-button"
              @click="search"
            >
              Rechercher
            </b-button>
          </b-nav-form>
        </b-navbar-nav>

        <b-navbar-nav class="ml-auto">
          <template v-if="user">
            <b-nav-item-dropdown
              text="Catégories"
              right
              class="category-dropdown"
            >
              <b-dropdown-item
                v-for="category in categories"
                :key="category.id"
                :to="`/category/${category.id}`"
                class="dropdown-item"
              >
                {{ category.name }}
              </b-dropdown-item>
            </b-nav-item-dropdown>

            <b-nav-item to="/new-discussion" class="new-discussion">
              Nouvelle discussion
            </b-nav-item>

            <b-nav-item-dropdown :text="user.displayName || 'Profil'" right>
              <b-dropdown-item to="/profile" class="profile-link"
                >Mon profil</b-dropdown-item
              >
              <b-dropdown-item v-if="isAdmin" to="/admin" class="admin-link">
                Administration
              </b-dropdown-item>
              <b-dropdown-item @click="handleLogout" class="logout-link"
                >Déconnexion</b-dropdown-item
              >
            </b-nav-item-dropdown>
          </template>

          <template v-else>
            <b-nav-item to="/login" class="auth-link">Connexion</b-nav-item>
            <b-nav-item to="/register" class="auth-link"
              >Inscription</b-nav-item
            >
          </template>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import useAuth from "@/composables/useAuth";
import useFirestore from "@/composables/useFirestore";
import useNotification from "@/composables/useNotification";

export default {
  name: "NavbarNavbar",
  setup() {
    const { user, logout } = useAuth();
    const { getDocuments } = useFirestore("categories");
    const { addNotification } = useNotification();
    const router = useRouter();

    const categories = ref([]);
    const searchQuery = ref("");

    const isAdmin = computed(() => {
      if (!user.value) return false;
      return user.value.email === "admin@example.com"; // Replace with your admin logic
    });

    const handleLogout = async () => {
      await logout();
      addNotification("Vous êtes déconnecté", "success");
      router.push("/login");
    };

    const search = () => {
      if (searchQuery.value.trim()) {
        router.push(
          `/search?q=${encodeURIComponent(searchQuery.value.trim())}`
        );
        searchQuery.value = "";
      }
    };

    onMounted(async () => {
      try {
        categories.value = await getDocuments();
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    });

    return {
      user,
      categories,
      isAdmin,
      searchQuery,
      handleLogout,
      search,
    };
  },
};
</script>

<style scoped>
/* Navbar customization */
.navbar {
  background-color: #007bff;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white !important;
  margin-left: 290px;
}

.navbar-nav .nav-link {
  font-size: 1rem;
  color: white !important;
  margin-right: 50px;
  margin-left: 20px; /* Espacement entre les liens */
}

.navbar-nav .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

.search-input {
  max-width: 250px;
  margin-right: 30px;
  width: 300px;
}

.search-button {
  background-color: #28a745;
  color: white;
  border: none;
  width: 100px;
  margin-right: 30px;
}

.search-button:hover {
  background-color: #218838;
}

.category-dropdown .dropdown-item {
  font-size: 1rem;
}

.new-discussion {
  color: white;
  border-radius: 5px;
  width: 170px;
  margin-left: 20px;
  margin-right: 20px;
}

.new-discussion:hover {
  background-color: #0056b3;
}

.profile-link,
.admin-link,
.logout-link {
  font-size: 1rem;
  color: #007bff;
}

.profile-link:hover,
.admin-link:hover,
.logout-link:hover {
  color: #0056b3;
}

.auth-link {
  color: #007bff;
}

.auth-link:hover {
  color: #0056b3;
}

/* Espacement des éléments */
.ml-3 {
  margin-left: 1rem; /* Ajout d'un espacement à gauche de 1rem */
}

/* Espacement pour le formulaire de recherche */
.b-nav-form {
  margin-left: 20px; /* Espacement à gauche du formulaire de recherche */
}
</style>
