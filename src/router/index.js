import { createRouter, createWebHistory } from "vue-router";
import { auth } from "../firebase/config";
import Home from "../views/HomeView.vue";
import Login from "../views/LoginLogin.vue";
import Register from "../views/RegisterRegister.vue";
import Profile from "../views/ProfileProfile.vue";
import Discussion from "../views/DiscussionDiscussion.vue";
import Admin from "../views/AdminAdmin.vue";
import CategoryDebug from "@/components/CategoryDebug.vue";

// Composant pour la création/édition de discussion
const NewDiscussion = () => import("../components/NewDiscussionForm.vue");

// Composant pour la page de catégorie
const Category = () => import("../views/CategoryCategory.vue");

// Composant pour la page de recherche
const Search = () => import("../views/SearchSearch.vue");

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/debug/categories",
    name: "CategoryDebug",
    component: CategoryDebug,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: "/discussion/:discussionId",
    component: Discussion, // Your page where ResponseList is included
    props: true,
  },
  {
    path: "/discussion/:id/edit",
    name: "EditDiscussion",
    component: NewDiscussion,
    props: (route) => ({ discussionId: route.params.id }),
    meta: { requiresAuth: true },
  },
  {
    path: "/new-discussion",
    name: "NewDiscussion",
    component: NewDiscussion,
    meta: { requiresAuth: true },
  },
  {
    path: "/category/:id",
    name: "Category",
    component: Category,
    props: true,
  },
  {
    path: "/search",
    name: "Search",
    component: Search,
  },
  {
    path: "/admin",
    name: "Admin",
    component: Admin,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const currentUser = auth.currentUser;

  console.log("Navigation guard:", {
    route: to.path,
    requiresAuth,
    requiresAdmin,
    currentUser: currentUser
      ? {
          uid: currentUser.uid,
          email: currentUser.email,
        }
      : null,
  });

  if (requiresAuth && !currentUser) {
    console.log("Redirection vers /login: utilisateur non connecté");
    next("/login");
  } else if (requiresAdmin) {
    // Pour le débogage, désactivez temporairement la vérification d'admin
    console.log("Accès à une page admin");
    next(); // Permettre l'accès sans vérification pour le débogage

    /* Commentez cette partie pour le débogage
    if (currentUser && currentUser.email === 'admin@example.com') {
      next()
    } else {
      console.log('Redirection vers /: utilisateur non admin')
      next('/')
    }
    */
  } else {
    next();
  }
});

export default router;
