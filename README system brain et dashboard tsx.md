🧠 SYSTEM BRAIN & DASHBOARD
Autopilote Solaire — Cerveau décisionnel & cockpit commercial
🎯 OBJECTIF DU SYSTÈME
Ce projet implémente un cerveau décisionnel temps réel pour piloter une activité commerciale solaire. Il ne se contente pas d’afficher des données : 👉 il analyse, priorise, prévoit, alerte et recommande des actions concrètes.

Le système transforme des signaux faibles (vues, clics, délais, acomptes, montants) en :

Scores de danger

Niveau de tension globale

Priorités commerciales

Risques d’annulation

Stratégies de closing

L’ensemble est exposé dans un Dashboard premium (cockpit de pilotage).

🧩 ARCHITECTURE GÉNÉRALE
Plaintext
Data (studies, leads, paiements)
↓
SystemBrain (cerveau)
↓
Scores / États / Décisions
↓
Dashboard.tsx (cockpit)
↓
Actions humaines + automatisation
Le cerveau est centralisé, l’UI est une projection du cerveau.

🧠 SYSTEM BRAIN — RÔLE
buildSystemBrain() est le noyau. Il :

Structure les données.

Calcule des scores.

Détecte des situations à risque.

Produit des décisions exploitables par l’UI.

Alimente les modules avancés (prédiction, mémoire, closing assistant).

🧠 CE QUE FAIT LE SYSTEM BRAIN (FONCTIONNALITÉS)
1️⃣ Segmentation métier

À partir des études :

signed → dossiers signés.

sent → devis envoyés.

healthy → dossiers sans risque immédiat. Objectif : ne pas tout mélanger, raisonner par état business.

2️⃣ WAR ROOM — Zone de surveillance critique

Filtre : Signés | Moins de 14 jours | Sans acompte. 👉 C'est la zone de plus haut risque business. Chaque dossier reçoit :

dangerScore

behavior

cancellationRisk Ils sont triés automatiquement par danger pour voir en premier ce qui peut coûter le plus d’argent.

3️⃣ Analyse comportementale

Fonction : computeBehavioralRisk Classe chaque client en :

Muet : Aucun signal / fuite.

Agité : Consulte mais n’agit pas.

Intéressé : Clique / progresse.

Stable. Basé sur les vues, clics et le temps depuis la signature. Objectif : lire l’état mental client.

4️⃣ Danger Score

Fonction : computeDangerScore Score hybride basé sur le comportement, le temps et le montant financier. Exemple : plus un client est muet, plus le temps passe, plus le montant est élevé, plus le score explose.

5️⃣ Tension globale

Fonction : computeTensionLevel Calcule une tension système (0–100) selon le danger moyen, le volume de dossiers sensibles et le cash exposé. Donne la météo business au dirigeant.

6️⃣ Système d’urgence

Fonction : computeUrgencyMode Transforme la tension en modes : NORMAL, MEDIUM, HIGH, CRITICAL. Adapte le comportement du cockpit à la pression réelle avec un focus principal dédié.

7️⃣ Dossier prioritaire

Fonction : computePriorityCase Désigne automatiquement LE dossier à traiter maintenant, avec la raison métier et le contexte humain. Enlève la charge mentale du "je fais quoi maintenant ?".

8️⃣ Prédiction d’annulation

Module : computeCancellationRisk Calcule un pourcentage de risque d’abandon. Permet de passer d’un outil de suivi à un outil prédictif.

9️⃣ Mémoire décisionnelle

Module : logDecision Stocke l'état système, le score et l'action recommandée à chaque fois qu'un dossier prioritaire est désigné. Objectif : apprentissage, audit, IA future.

🔟 Closing assistant (copilote commercial)

Module : generateClosingStrategy Transforme des scores en objectif, diagnostic, stratégie et message prêt à envoyer.

📊 DASHBOARD.TSX — RÔLE
Le Dashboard est un cockpit, pas une liste. Il est branché sur le cerveau et affiche :

État global & Tension.

Alertes critiques & War Room priorisée.

Pipeline commercial & leads automatisés.

Logs de décisions. Actions proposées : Appels directs, accès dossiers, validation acompte, annulation.

🧩 README — VERSION TECHNIQUE ÉQUIPE
(Onboarding dev / produit / data)

🧱 Architecture Technique

Plaintext
Data sources (DB / API) -> Normalization (useDashboard) -> SystemBrain (analyse & décision) -> UI Cockpit (Dashboard.tsx) -> Human actions / Decision Memory (logs)
🧬 Modules internes (Détails Dev)

Segmentation : Isole les populations métier (signed, sent, healthy).

War Room : Enrichissement avec dangerScore et tri automatique.

Behavioral engine : Analyse du "faible signal" (clics/vues).

Danger engine : Score composite (comportement + inertie + cash).

Tension engine : Produit l'indicateur 0-100 pour les modes visuels.

Priority engine : Détermine le "Quoi / Pourquoi / Comment".

Prediction engine : Prépare le terrain pour le ML futur.

🧠 Principes de conception

Cerveau unique : La logique est centralisée hors de l'UI.

Règles explicites : Aucune logique cachée dans les composants.

Extensible IA-first : Data-driven, pas écran-driven.

🚀 README — VERSION SaaS / PITCH PRODUIT
(Vision, produit, valeur, business)

⚡ Autopilote Solaire : Le copilote intelligent

❌ Le Problème : CRM passifs, dossiers qui meurent en silence, décisions à l'intuition, perte de CA. ✅ La Solution : Un moteur qui surveille, détecte les signaux faibles, anticipe les risques et désigne les priorités.

🎯 Valeur business

Réduction des annulations.

Accélération des acomptes.

Baisse de la charge mentale.

Sécurisation du chiffre d'affaires.

🧩 Ce qui rend le produit différent

Il montre des décisions, pas des données.

Il classe par danger business, pas par date.

Il lit le comportement, il ne suit pas juste les étapes.

🧠 PHILOSOPHIE & ÉVOLUTIONS
Ce projet n’est pas un CRM. C’est un système de pilotage et un embryon d’IA métier.

Objectifs à moyen terme :

Apprentissage automatique (via logs).

Seuils adaptatifs & Scoring personnalisé.

Recommandations multi-canales & Prédiction de closing.
