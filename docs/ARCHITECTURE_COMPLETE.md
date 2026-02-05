# AUTOPILOTE SOLAIRE — Architecture Complète (La Bible)

**Dernière mise à jour :** 04 Février 2026
**Statut :** SYSTÈME UNIFIÉ & ACTIF

Ce document est la **Source de Vérité Unique**. Il décrit le fonctionnement technique, logique et fonctionnel de la plateforme.

---

## 1. Vue d'Ensemble (The Big Picture)

Le système est un **Organisme Vivant** composé de 3 organes majeurs :
1.  **Le Corps (ResultsDashboard)** : L'interface terrain où la vente se passe (`Simulation`).
2.  **Le Cerveau (Agent Zero / Brain)** : L'intelligence qui décide *comment* vendre (Psychologie).
3.  **Le Moniteur (Ops Agent / Email Engine)** : L'arrière-boutique qui protège et relance (Gouvernance).

---

## 2. Le Corps : `ResultsDashboard.REFONTE2.tsx`
C'est le *front-line*. Tout part d'ici.
- **Rôle** : Calculatrice financière, Présentateur, Closer.
- **Architecture** : Single Page Application (SPA) massive.
- **Système** : Le dashboard obéit aux ordres du Cerveau via un **Contrat de Mapping** (`agentZeroModuleContract.ts`).

---

## 3. Le Cerveau : Agent Zero (`src/brain/agentZeroClient.ts`)
L'intelligence déportée qui analyse la psychologie du prospect.

### Anatomie
- **Localisation** : `src/brain/agentZeroClient.ts` (Client) -> `autopilote.pythonanywhere.com` (Serveur Python).
- **Entrée** : `ProfileDetectionResult` (Signaux faibles, hésitations, réponses).
- **Sortie** : `Plan` (Stratégie, Ordre des modules, Vitesse).
- **Sécurité** :
    - **Mode Fallback** : Si le serveur ne répond pas en 5s, le client bascule en mode "Standard" (Plan de secours local).
    - **Isolation** : Agent Zero ne connait pas l'identité du client, seulement son profil psychologique.

---

## 4. Le Moniteur : Ops Agent (`src/ops-agent/`)
C'est le système de **Gouvernance Opérationnelle**. Il ne vend pas, il empêche les erreurs.

### Philosophie
"Ops Agent ne devine rien. Il observe la base de données matérialisée."
*Fichier Moteur : `src/ops-agent/opsAgent.engine.ts`*

### Les 3 Axes de Décision
L'agent scanne chaque dossier et l'attribue à un Axe :
- **AXE A (Anti-Annulation)** : Dossiers signés mais à risque (Pas d'acompte, SRU proche).
    - *Action* : WAR ROOM immédiate.
- **AXE B (Inertie)** : Dossiers post-RDV qui refroidissent.
    - *Action* : Relance prioritaire.
- **AXE C (Leads)** : Nouveaux contacts entrants.
    - *Action* : Qualification ou Abandon.

### Auditabilité
Chaque décision de l'Ops Agent génère une trace (`decision_logs`) expliquant **POURQUOI** une action est demandée (Ex: "Axe A - Acompte manquant depuis 48h").

---

## 5. L'Exécuteur : Email Engine (`src/email-engine/`)
Le moteur d'envoi autonome, conçu pour tourner en tâche de fond (Cron/Worker).
*Fichier : `src/email-engine/sendNextEmail.ts`*

### Le Flux de Sécurité (Guards)
Avant d'envoyer le moindre mail, le moteur passe 3 check-points :
1.  **RGPD Guard** : Le client est-il Opt-out ? (Si oui -> Stop).
2.  **Fatigue Guard** : Le client a-t-il été trop sollicité aujourd'hui ? (Si > X actions -> Stop).
3.  **Temporal Guard** : Est-ce le bon moment ? (Pas de mail la nuit, respect des délais d'espacement).

### Logique d'Envoi
Si tous les feux sont verts, le mail part via le provider (SendGrid/Resend) et la base est mise à jour (`email_leads`).

---

## 6. Synthèse des Flux (Cross-check)

| Composant | Fichier Maître | Déclencheur | Cible |
| :--- | :--- | :--- | :--- |
| **Simulateur** | `ResultsDashboard.REFONTE2.tsx` | Interaction Utilisateur | Client Final |
| **Banquier Coach** | `coaches/BanquierCoachPhases.ts` | Scroll / Clic | Modules UI (Graphique) |
| **Agent Zero** | `brain/agentZeroClient.ts` | Réponse Question | UX Dashboard |
| **Ops Agent** | `ops-agent/opsAgent.engine.ts` | Snapshot Base de Données | Dashboard Manager (War Room) |
| **Email Engine** | `email-engine/sendNextEmail.ts` | Cron Job | Boîte Mail Client |

---

**FIN DU DOCUMENT**
*Architecture validée et auditée le 04/02/2026.*
