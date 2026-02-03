# 🧠 Cœur Logique : Le System Brain
**Version** : 2.2.0 (AXE A/B/C Update)
**Status** : TECHNICAL DEEP-DIVE

Ce document détaille les algorithmes et les règles métier qui transforment les données brutes en intelligence décisionnelle.

## 🧬 Layer 0 : Le Profilage Psychologique (Quiz)
Avant toute analyse comportementale, le système établit le **Profil Dominant** du client via le Quiz d'entrée.

### Classification des Profils
1.  **Senior 🛡️**
    *   *Signal* : Cherche la sécurité avant tout.
    *   *Impact Brain* : Le module "Garanties" devient critique. Tout silence sur ce module génère une alerte immédiate.
2.  **Banquier 📊**
    *   *Signal* : Cherche le ROI et la précision.
    *   *Impact Brain* : Focus sur "Tableaux Financiers". Le discours doit être factuel, sans émotion.
3.  **Standard ⚡**
    *   *Signal* : Cherche la simplicité et l'action.
    *   *Impact Brain* : Parcours accéléré, focus sur "Économies Immédiates".

### Hybridation
Si l'écart de score entre deux profils est ≤ 1, le système lance une **Question Bonus** pour forcer une décision tranchée (pas de profil "moyen").
En cas d'ambiguïté persistante, le système favorise le profil **Senior** (Sécurité = Moins de risque d'annulation).

### Interface Technique (PsychoSignals)
Le Quiz transmet un objet structuré au reste du système :
```typescript
{
  peurDeSeTromper: boolean;  // Verrouille l'UX sur la sécurité
  besoinDeChiffres: boolean; // Force l'affichage des preuves mathématiques
  urgencePercue: boolean;    // Active les comparateurs temporels
  indecision: boolean;       // Ralentit le tempo du Coach
}
```
0.1 — Couche d'Orchestration (Agent Zero)
Ces signaux ne sont pas traités en dur par le code React, mais envoyés à **Agent Zero** qui renvoie une configuration d'affichage (Ordre, Tempo, Scarcity). Le code execute ensuite cette décision via CSS.

## 🌡️ Température Comportementale
Le système classe chaque dossier selon son profil d'interaction (vues et clics sur les emails).

| État | Règle Métier | Signification |
| :--- | :--- | :--- |
| **Muet** 🧊 | 0 Vues, 0 Clics | Désengagement total. Le client n'a même pas ouvert l'email. |
| **Agité** 🔥 | ≥ 3 Vues, 0 Clic | Stress ou doute. Le client regarde l'étude de manière répétée sans cliquer. |
| **Intéressé** 🟢 | ≥ 1 Clic | Engagement positif. Le client explore les détails. |
| **Fatigue** ⚠️ | ≥ 4 Envois, 0 Vue | Sur-sollicitation. Le client ignore systématiquement les relances. |
| **Cas Limite** 🔴 | > 10 Vues | Obsession ou partage du lien. Risque de fuite ou de surengagement. |
| **Stable** ⚪ | Engagement normal | Activité saine prévue par le modèle. |

## ⚔️ Le Moteur de la War Room
## ⚔️ Le Moteur de la War Room (Stratégie par Axes)
La War Room est divisée en 3 axes stratégiques couvrant tout le cycle de vie :

### AXE A — DOSSIERS SIGNÉS (Anti-Annulation)
*Cible : Status `signed`.*
*   **🚨 WAR ROOM** : `dangerScore >= 70` OU (`!deposit_paid` ET `Signé > 7 jours`). Priorité absolue.
*   **🟠 À SÉCURISER** : `!deposit_paid` OU `behavior == AGITÉ`. Acompte manquant ou stress client.
*   **🟢 SOUS CONTRÔLE** : Acompte payé, comportement stable.
*   **⛔ HORS PÉRIMÈTRE** : Dossier marqué manuellement comme "Sécurisé" ou Annulé.

### AXE B — POST-RDV SANS SIGNATURE (Relance Chaude)
*Cible : Status `sent` (Etude envoyée).*
*   **🔥 À RELANCER (CHAUD)** : `behavior == INTÉRESSÉ` (Clics détectés). Le client compare activement.
*   **🟠 À SURVEILLER** : `behavior == AGITÉ` (Ouvertures multiples, sans clic). Curiosité ou doute.
*   **🧊 À RÉVEILLER** : `behavior == MUET` ET `Envoi < 7 jours`. Pas encore de réaction.
*   **⛔ STOP** : `behavior == FATIGUÉ`. Trop de relances, aucune réaction.

### AXE C — LEADS JAMAIS JOINTS (Prospection / Réactivation)
*Cible : Leads sans étude associée.*
*   **🔥 À APPELER** : `Clicks >= 1`. Intérêt marqué pour un contenu marketing.
*   **🟠 À OBSERVER** : `Opens >= 1`. Curiosité passive.
*   **🧊 À ABANDONNER** : Aucun signe de vie.

---
## 🔢 Calcul du Danger Score
Le scoring (0-100) est dynamique :
*   **Base** : 50 points.
*   **Temps** : +X points par jour sans acompte.
*   **Comportement** : 
    *   +20 points si "Muet" (Risque de Ghosting).
    *   +10 points si "Agité" (Risque de Doute).
    *   -10 points si "Intéressé" (Engagement positif).

## 💰 Analyse de Tension (Financial Risk)
Le Brain calcule en continu la "Tension Système" basée sur deux piliers :
1.  **CA en Danger** : Somme pondérée des dossiers signés mais non sécurisés (War Room).
2.  **Pression Temporelle** : Analyse des interactions email sur une fenêtre glissante de **14 jours** (avec injection de bruit statistique si vide pour maintenir la vigilance visuelle).
3.  **Anomalies de Flux** : Détection des "Acomptes en retard" (dépassement des délais moyens).

## 📡 Le Moteur de Synchronisation
Le Brain s'auto-rafraîchit toutes les **60 secondes**.
1.  **Fetch** : Récupération des données études, clients et tracking sur Supabase.
2.  **Cross-Reference** : Fusion des événements de tracking avec les dossiers.
3.  **Engine Pass** : Passage des dossiers dans les moteurs (Behavior, Cancellation, Urgency).
4.  **Decision Mapping** : Production de la `NextAction` (ex: "Appeler pour sécuriser l'acompte").

---
*Le code source de cette logique se trouve dans `src/brain/Engine.ts` et `src/brain/intelligence/`.*
