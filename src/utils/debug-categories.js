import { db } from "@/firebase/config";
import { collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";

// Fonction pour afficher toutes les catégories
export const listAllCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    console.log(`Nombre de catégories trouvées: ${snapshot.size}`);

    if (snapshot.empty) {
      console.log("Aucune catégorie trouvée dans la base de données");
      return [];
    }

    const categories = [];
    snapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      });
      console.log(`Catégorie: ${doc.data().name}, ID: ${doc.id}`);
    });

    return categories;
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error);
    return [];
  }
};

// Fonction pour créer une catégorie de test
export const createTestCategory = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const newCategory = {
      name: "Catégorie de test",
      description: "Cette catégorie a été créée pour tester la fonctionnalité",
      createdAt: new Date(),
    };

    const docRef = await addDoc(categoriesRef, newCategory);
    console.log(`Catégorie de test créée avec succès. ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie de test:", error);
    return null;
  }
};

// Fonction pour supprimer toutes les catégories (à utiliser avec précaution)
export const deleteAllCategories = async () => {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      console.log("Aucune catégorie à supprimer");
      return;
    }

    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });

    await Promise.all(deletePromises);
    console.log(`${deletePromises.length} catégories supprimées avec succès`);
  } catch (error) {
    console.error("Erreur lors de la suppression des catégories:", error);
  }
};
