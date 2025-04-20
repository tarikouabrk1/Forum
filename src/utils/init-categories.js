import { db } from "@/firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";

const defaultCategories = [
  {
    name: "Général",
    description: "Discussions générales sur divers sujets",
  },
  {
    name: "Aide & Support",
    description: "Demandez de l'aide ou offrez votre support",
  },
  {
    name: "Actualités",
    description: "Discussions sur l'actualité et les événements récents",
  },
  {
    name: "Technologie",
    description:
      "Discussions sur la technologie, les gadgets et l'informatique",
  },
  {
    name: "Loisirs",
    description:
      "Discussions sur les loisirs, les sports et les divertissements",
  },
];

export const initCategories = async () => {
  try {
    // Vérifier si des catégories existent déjà
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      console.log(
        "Aucune catégorie trouvée, initialisation des catégories par défaut..."
      );

      // Ajouter les catégories par défaut
      const promises = defaultCategories.map((category) =>
        addDoc(categoriesRef, {
          ...category,
          createdAt: new Date(),
        })
      );

      await Promise.all(promises);
      console.log("Catégories par défaut créées avec succès");
      return true;
    } else {
      console.log("Des catégories existent déjà dans la base de données");
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation des catégories:", error);
    return false;
  }
};
