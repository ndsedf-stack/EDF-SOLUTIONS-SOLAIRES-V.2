# 🛰️ DOCUMENTATION SYSTÈME : AUTOPILOTE SOLAIRE v2.0

## 📂 MANUEL D'EXPLOITATION & SPÉCIFICATIONS TECHNIQUES

Ce document contient l'intégralité des connaissances nécessaires pour maintenir, modifier et utiliser le dashboard de surveillance conçu pour Nicolas Di Stefano.

---

## 🛠️ I. ARCHITECTURE DES DONNÉES (Le Cerveau)

Le système est branché sur une base PostgreSQL via Supabase. Il ne se contente pas de lire des données, il les croise.

### 1. Les Tables Sources

| Table                      | Rôle                  | Champs Clés                                        |
| :------------------------- | :-------------------- | :------------------------------------------------- |
| `studies`                  | État civil du dossier | `id`, `status`, `created_at`, `client_id`          |
| `clients`                  | Identité              | `first_name`, `last_name`, `email`                 |
| `studies_activity_summary` | Moteur d'engagement   | `email_opens` (vues), `interactions` (clics)       |
| `decision_logs`            | **La Boîte Noire**    | `action_performed`, `justification`, `client_name` |

### 2. Le Flux d'Information

1. La fonction `loadData()` lance une requête `Promise.all` (lecture simultanée) sur les tables.
2. Le script JavaScript effectue une **jointure virtuelle** entre les dossiers et leurs statistiques d'engagement.
3. Le résultat est stocké dans la variable globale `fullData` avant d'être injecté dans le DOM.

---

## 🔬 II. LOGIQUE DÉCISIONNELLE (Les Algorithmes)

### 1. Détection des Anomalies (Fonction `detectAnomalies`)

Le système n'est pas "intelligent", il est **vigilant**. Il applique deux filtres de friction :

- **Alerte "Intérêt Stagnant" (Orange/Rouge) :**
  - _Condition :_ `status === "sent"` ET `views > 5` ET `clicks === 0`.
  - _Interprétation :_ Le client regarde le devis en boucle mais n'ose pas cliquer sur le lien de signature ou de RDV. Bloqué psychologiquement ?
- **Alerte "Silence Post-Signature" (Rouge) :**
  - _Condition :_ `status === "signed"` ET `diffDays > 3` ET `views < 2`.
  - _Interprétation :_ Le contrat est signé mais le client ne consulte plus ses documents de mise en service. Risque de désengagement ?

### 2. La "Boîte Noire" (Fonction `forceAction`)

C'est le verrou de sécurité. Si un dossier est en alerte :

1. Le clic sur "Signé" ou le changement de statut via le menu déroulant est **intercepté**.
2. La fonction `forceAction` suspend l'envoi vers la base de données.
3. Elle déclenche la modale `<dialog id="override-modal">`.
4. **Action Finale :** La mise à jour du statut ne se déclenche **QUE SI** l'insertion dans la table `decision_logs` est confirmée (Succès du `logError`).

---

## 🕹️ III. MODE D'EMPLOI OPÉRATIONNEL (L'Usage)

### 1. Navigation Quotidienne

- **Le Voyant de Bord (Top Gauche) :** Si un point vert brille, tout est stable. S'il clignote rouge, des anomalies demandent ton arbitrage.
- **Mode Priorité (Bouton Orange Haut) :** À utiliser quand tu as peu de temps. Il cache tous les dossiers "morts" pour ne montrer que ceux où le client a fait au moins un geste (vue ou clic).
- **Le Compteur de File :** Affiche le nombre d'emails en attente d'envoi dans Supabase (table `email_queue`).

### 2. Actions sur les Dossiers

- **Le Sélecteur de Statut :** Permet de changer manuellement la phase d'un dossier.
- **Bouton SIGNÉ (Vert) :** Raccourci direct pour valider une vente.
- **Bouton DRAFT (Bleu) :** Permet de faire reculer un dossier en brouillon s'il y a eu une erreur.
- **La Croix (Rouge) :** Annule le dossier (statut `cancelled`).

---

## 🛠️ IV. GUIDE DE PERSONNALISATION (Comment changer les choses)

### Changer les seuils de sensibilité

Si tu trouves que le système alerte trop souvent, modifie ces valeurs à la ligne 124 :

```javascript
let settings = {
    view_threshold: 10, // Alerte après 10 vues au lieu de 5
    day_threshold: 7    // Alerte après 7 jours au lieu de 3
};
Modifier le design d'une ligne
Tout se passe dans la fonction render(). La variable tbody.innerHTML contient le squelette HTML de chaque ligne. Tu peux y modifier les couleurs CSS (ex: changer text-blue-400 en text-purple-400).

Ajouter un nouveau statut
Ajoute l'option dans le <select> de la fonction render(). Assure-toi que le nom du statut correspond exactement à ce qui est attendu dans ta base de données Supabase.

📝 V. ÉVOLUTIONS UX (Principes à suivre)
Pour toute nouvelle fonctionnalité, respecte les Principes Intangibles :

Suggestion, jamais Obligation : Le dashboard suggère des dossiers à regarder (Lecture Guidée), mais il ne masque jamais le reste.

Mémoire du Cerveau : Préférer les badges informatifs (Vu hier, Relancé) aux notifications push agressives.

Champ Obligatoire : Toute action "forcée" (contre l'avis du système) DOIT rester liée à une justification textuelle. C'est ce qui crée ta base de connaissances.
```
