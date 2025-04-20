<script setup>
import { createOrUpdateAdminUser } from "@/utils/create-admin-user";
import { auth } from "@/firebase/config";

// Assurez-vous d'être connecté
if (auth.currentUser) {
  createOrUpdateAdminUser(auth.currentUser.uid, auth.currentUser.email);
}
</script>
