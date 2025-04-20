import { db } from "@/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";

export const createOrUpdateAdminUser = async (userId, email) => {
  try {
    if (!userId || !email) {
      console.error("ID utilisateur et email requis");
      return false;
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // Créer un nouvel utilisateur admin
      await addDoc(usersRef, {
        uid: userId,
        email: email,
        displayName: "Administrateur",
        isAdmin: true,
        createdAt: new Date(),
      });
      console.log("Utilisateur admin créé avec succès");
    } else {
      // Mettre à jour l'utilisateur existant
      const userDoc = querySnapshot.docs[0];
      await updateDoc(doc(db, "users", userDoc.id), {
        isAdmin: true,
      });
      console.log("Utilisateur mis à jour en tant qu'admin");
    }

    return true;
  } catch (error) {
    console.error(
      "Erreur lors de la création/mise à jour de l'utilisateur admin:",
      error
    );
    return false;
  }
};
