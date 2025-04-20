import { ref } from "vue";
import { db } from "@/firebase/config";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const useFirestore = (collectionName) => {
  const error = ref(null);
  const isPending = ref(false);

  console.log(`useFirestore initialisé pour la collection: ${collectionName}`);

  // Ajouter un document
  const addDocument = async (document) => {
    error.value = null;
    isPending.value = true;

    try {
      console.log(
        `Tentative d'ajout d'un document dans ${collectionName}:`,
        document
      );
      const collectionRef = collection(db, collectionName);
      const docRef = await addDoc(collectionRef, {
        ...document,
        createdAt: serverTimestamp(),
      });
      console.log(
        `Document ajouté avec succès dans ${collectionName}, ID:`,
        docRef.id
      );
      isPending.value = false;
      return docRef;
    } catch (err) {
      console.error(
        `Erreur lors de l'ajout d'un document dans ${collectionName}:`,
        err
      );
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Supprimer un document
  const deleteDocument = async (id) => {
    error.value = null;
    isPending.value = true;

    try {
      console.log(
        `Tentative de suppression du document ${id} dans ${collectionName}`
      );
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      console.log(`Document ${id} supprimé avec succès de ${collectionName}`);
      isPending.value = false;
    } catch (err) {
      console.error(
        `Erreur lors de la suppression du document ${id} dans ${collectionName}:`,
        err
      );
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Mettre à jour un document
  const updateDocument = async (id, updates) => {
    error.value = null;
    isPending.value = true;

    try {
      console.log(
        `Tentative de mise à jour du document ${id} dans ${collectionName}:`,
        updates
      );
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updates);
      console.log(
        `Document ${id} mis à jour avec succès dans ${collectionName}`
      );
      isPending.value = false;
    } catch (err) {
      console.error(
        `Erreur lors de la mise à jour du document ${id} dans ${collectionName}:`,
        err
      );
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Obtenir un document par ID (sécurisé)
  const getDocument = async (id) => {
    error.value = null;
    isPending.value = true;

    if (!id || typeof id !== "string") {
      console.warn(`[getDocument] ID invalide ou indéfini:`, id);
      error.value = "ID invalide ou indéfini";
      isPending.value = false;
      return null;
    }

    try {
      console.log(`Récupération du document ${id} dans ${collectionName}`);
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      isPending.value = false;

      if (docSnap.exists()) {
        console.log(
          `Document ${id} trouvé dans ${collectionName}:`,
          docSnap.data()
        );
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.log(`Document ${id} non trouvé dans ${collectionName}`);
        return null;
      }
    } catch (err) {
      console.error(
        `Erreur lors de la récupération du document ${id} dans ${collectionName}:`,
        err
      );
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  // Obtenir des documents avec filtrage
  const getDocuments = async (conditions = [], sortBy = null) => {
    error.value = null;
    isPending.value = true;

    try {
      console.log(`Récupération des documents dans ${collectionName}`);
      console.log("Conditions:", conditions);
      console.log("Tri:", sortBy);

      const collectionRef = collection(db, collectionName);
      let q = collectionRef;

      if (conditions && conditions.length > 0) {
        const queryConstraints = conditions.map((condition) => {
          return where(condition.field, condition.operator, condition.value);
        });

        q = query(collectionRef, ...queryConstraints);
      }

      if (sortBy) {
        q = query(q, orderBy(sortBy.field, sortBy.direction || "asc"));
      }

      const querySnapshot = await getDocs(q);

      console.log(
        `Nombre de documents trouvés dans ${collectionName}:`,
        querySnapshot.size
      );

      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });

      isPending.value = false;
      return results;
    } catch (err) {
      console.error(
        `Erreur lors de la récupération des documents dans ${collectionName}:`,
        err
      );
      error.value = err.message;
      isPending.value = false;
      throw err;
    }
  };

  return {
    error,
    isPending,
    addDocument,
    deleteDocument,
    updateDocument,
    getDocument,
    getDocuments,
  };
};

export default useFirestore;
