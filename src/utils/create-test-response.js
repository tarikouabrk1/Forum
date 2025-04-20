import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * Crée une réponse de test pour une discussion spécifique
 * @param {string} discussionId - L'ID de la discussion
 * @returns {Promise<string>} - L'ID de la réponse créée
 */
export const createTestResponse = async (discussionId) => {
  try {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      throw new Error("Utilisateur non connecté");
    }

    const responseData = {
      discussionId,
      content: `Ceci est une réponse de test créée le ${new Date().toLocaleString(
        "fr-FR"
      )}`,
      authorId: user.uid,
      authorName: user.displayName || user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      edited: false,
      likes: 0,
      likedBy: [],
    };

    const docRef = await addDoc(collection(db, "responses"), responseData);
    console.log("Réponse de test créée avec ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la réponse de test:", error);
    throw error;
  }
};

/**
 * Crée une fonction pour créer ou mettre à jour un utilisateur admin
 * @param {string} uid - L'ID de l'utilisateur
 * @param {string} email - L'email de l'utilisateur
 * @returns {Promise<boolean>} - True si réussi
 */
export const createOrUpdateAdminUser = async (uid, email) => {
  try {
    const db = getFirestore();

    // Dans une application réelle, vous devriez utiliser des fonctions Cloud Firebase
    // pour gérer les rôles d'administration de manière sécurisée
    // Ceci est juste pour le débogage

    const adminData = {
      uid,
      email,
      role: "admin",
      updatedAt: serverTimestamp(),
    };

    await addDoc(collection(db, "admins"), adminData);
    console.log("Utilisateur admin créé/mis à jour:", uid);
    return true;
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour de l'admin:", error);
    throw error;
  }
};
