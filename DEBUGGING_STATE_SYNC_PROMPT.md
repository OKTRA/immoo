# Prompt Universel pour le Débogage de la Désynchronisation d'État

Ce document fournit un prompt réutilisable pour diagnostiquer et résoudre les problèmes de désynchronisation de l'état de l'interface utilisateur après une action asynchrone (connexion, soumission de formulaire, etc.).

---

### Titre du Prompt

Diagnostic et Résolution des Problèmes de Désynchronisation d'État Post-Action

### Contexte

Je rencontre un problème de synchronisation d'état. Après avoir effectué une action (par exemple, une connexion dans une modale, la soumission d'un formulaire), l'état global de l'application est bien mis à jour côté logique (par exemple, un `toast` de succès s'affiche, l'appel API a réussi), mais l'interface utilisateur principale ne se met pas à jour pour refléter ce changement. Je dois actualiser manuellement la page pour que la nouvelle interface s'affiche correctement.

### Objectif

Analyser le flux de données entre le composant qui déclenche l'action et le gestionnaire d'état global, puis refactoriser le code pour garantir que l'interface utilisateur se met à jour de manière réactive et automatique sans nécessiter une actualisation manuelle.

### Instructions de Diagnostic

1.  **Identifier la Source de Vérité :** Quel est le système de gestion d'état global ? (Context API, Redux, Zustand, etc.). Localise le fichier où l'état est défini et où les actions (comme `signIn`, `updateData`) sont implémentées.

2.  **Identifier le Déclencheur :** Quel composant déclenche l'action ? (Ex: `LoginDialog.tsx`, `EditForm.tsx`). Localise la fonction qui appelle l'action globale (Ex: `handleSubmit`).

3.  **Analyser le Flux de Communication :**
    *   Examine la fonction d'action dans le gestionnaire d'état global. Est-ce qu'elle retourne une `Promise` ou est-elle "fire-and-forget" (elle ne retourne rien) ?
    *   Examine la fonction dans le composant déclencheur. Utilise-t-elle `async/await` pour appeler l'action globale ?
    *   Que se passe-t-il immédiatement après l'appel de l'action ? Y a-t-il une fermeture de modale (`onSuccess()`, `onClose()`), une redirection (`navigate()`) ou une autre action qui pourrait se produire *avant* que l'état global ne soit mis à jour ?

### Plan de Résolution Proposé

1.  **Modifier l'Action Globale :** Si elle ne le fait pas déjà, modifie la fonction d'action dans le gestionnaire d'état pour qu'elle retourne une `Promise` qui se résout **après** la mise à jour de l'état.

2.  **Modifier le Composant Déclencheur :**
    *   Assure-toi que la fonction qui appelle l'action globale est déclarée `async`.
    *   Utilise `await` lors de l'appel de l'action globale.
    *   Place toutes les actions de suivi (fermeture de modale, redirection, etc.) **après** l'instruction `await`, idéalement dans un bloc `try...catch...finally` pour gérer les succès, les erreurs et le nettoyage.

### Exemple de Code (Avant / Après)

```javascript
// --- AVANT ---

// store.js
function updateUser(data) {
  api.post('/user', data); // Fire-and-forget
  // L'état sera mis à jour plus tard, de manière asynchrone
}

// MyModal.jsx
async function handleSubmit(data) {
  store.updateUser(data);
  closeModal(); // Trop tôt !
}


// --- APRÈS ---

// store.js
function updateUser(data) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await api.post('/user', data);
      // Mettre à jour l'état ici
      setState(...); 
      resolve(response); // Résoudre la promesse APRES la mise à jour
    } catch (error) {
      reject(error);
    }
  });
}

// MyModal.jsx
async function handleSubmit(data) {
  try {
    await store.updateUser(data); // On attend que tout soit fini
    closeModal(); // C'est le bon moment !
  } catch (error) {
    console.error("Failed to update user", error);
  }
}
``` 