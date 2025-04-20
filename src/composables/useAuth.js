import { ref } from "vue";
import { auth } from "@/firebase/config";
import { getFirestore, doc, setDoc } from "firebase/firestore"; // Add Firestore imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

const user = ref(null);
const error = ref(null);
const isPending = ref(false);

// Surveiller l'état de l'authentification
onAuthStateChanged(auth, (_user) => {
  user.value = _user;
});

const useAuth = () => {
  const signup = async (email, password, displayName) => {
    error.value = null;
    isPending.value = true;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!res) {
        throw new Error("Impossible de créer un compte");
      }

      // Mettre à jour le profil avec le nom d'utilisateur
      await updateProfile(res.user, { displayName });

      // Ajouter l'utilisateur à Firestore dans la collection 'users'
      const db = getFirestore();
      const userRef = doc(db, "users", res.user.uid);
      await setDoc(userRef, {
        uid: res.user.uid,
        email: res.user.email,
        displayName, // Si tu veux stocker d'autres informations utilisateur, tu peux les ajouter ici
        createdAt: new Date().toISOString(), // Par exemple, l'heure de création du compte
      });

      error.value = null;
      isPending.value = false;
      return res;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
    }
  };

  const login = async (email, password) => {
    error.value = null;
    isPending.value = true;

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      error.value = null;
      isPending.value = false;
      return res;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
    }
  };

  const logout = async () => {
    error.value = null;
    isPending.value = true;

    try {
      await signOut(auth);
      isPending.value = false;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
    }
  };

  const resetPassword = async (email) => {
    error.value = null;
    isPending.value = true;

    try {
      await sendPasswordResetEmail(auth, email);
      isPending.value = false;
      return true;
    } catch (err) {
      console.error(err.message);
      error.value = err.message;
      isPending.value = false;
      return false;
    }
  };

  return { user, error, isPending, signup, login, logout, resetPassword };
};

export default useAuth;
