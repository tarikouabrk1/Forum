import { db } from "@/firebase/config";
import { collection, addDoc } from "firebase/firestore";

export const createTestResponse = async (discussionId) => {
  try {
    if (!discussionId) {
      console.error("ID de discussion requis");
      return null;
    }

    const responsesRef = collection(db, "responses");
    const newResponse = {
      discussionId: discussionId,
      content:
        "Ceci est une réponse de test pour déboguer l'affichage des réponses.",
      authorId: "test-user-id",
      authorName: "Utilisateur Test",
      createdAt: new Date(),
      edited: false,
    };

    const docRef = await addDoc(responsesRef, newResponse);
    console.log(`Réponse de test créée avec succès. ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la réponse de test:", error);
    return null;
  }
};
