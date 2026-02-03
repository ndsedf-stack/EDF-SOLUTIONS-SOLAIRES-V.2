# BRAIN ARCHITECTURE DOCUMENTATION
> **Layer**: `src/lib/brain`
> **Role**: Intelligence Contractuelle Centralisée (The Sovereign Protocol).

Ce dossier contient l'intégralité de l'intelligence système.
**Règle d'Or** : Aucune logique métier ne doit exister en dehors de ce dossier. L'UI (React) est un simple afficheur.

---

## 1. STRUCTURE DES COUCHES (DATA FLOW)

Les données ne remontent jamais le courant.
`DATA` -> `SIGNALS` -> `ENGINES` -> `DECISION` -> `SYNTHESIS` -> `MEMORY`

### A. `/signals` (Les Yeux)
*   **Role** : Observation brute. Ne juge pas, ne décide pas.
*   **Exemple** : "Le client a cliqué 0 fois en 7 jours." (Signaleur Engagement).
*   **Output** : `BrainSignal` (Factuel).

### B. `/engines` (Le Cerveau Analytique)
*   **Role** : Transformation des signaux en scores.
*   **Composant Central** : `CVIEngine` (Contract Volatility Index).
*   **Output** : `AnalysisResult` (Score 0-100, Statut).
*   **Note** : C'est ici que vit l'algorithme de calcul de risque.

### C. `/decision` (Le Cerveau Exécutif)
*   **Role** : Prise de décision basée sur le score.
*   **Exemple** : "Si CVI > 50 (Critical) => Alors ACTION: Notify Human".
*   **Output** : `PrescribedAction` (Ordre).

### D. `/synthesis` (Le Chef d'Orchestre)
*   **Role** : Aggregation et "Big Picture".
*   **Composant Central** : `takeSystemSnapshot`.
*   **Mission** : Appeler les engines, puis les décideurs, puis calculer les métriques globales (Tension Système, Cash at Risk).
*   **Output** : `SystemSnapshot` (L'objet unique consommé par l'UI).

### E. `/memory` (La Mémoire)
*   **Role** : Historisation et Apprentissage.
*   **Mission** : Logger chaque snapshot pour permettre le "Time Travel" et le recalibrage futur.

---

## 2. TYPES CENTRAUX

Tous définis dans `types.ts` ou dans les sous-dossiers respectifs.

*   `BrainEntity` : L'atome (Study, Lead).
*   `BrainSignal` : Le fait observé.
*   `CVIOutput` : Le score calculé.
*   `PrescribedAction` : L'ordre donné.
*   `SystemSnapshot` : L'état complet du monde à l'instant T.

---

## 3. RÈGLES DE DÉVELOPPEMENT

1.  **Strict Separation** : Un `Signal` ne calcule pas de score. Un `Engine` ne décide pas de l'action.
2.  **No UI Logic** : Si vous écrivez un `if (score > 50)` dans un composant `.tsx`, vous êtes viré.
3.  **Unique Entry Point** : L'app ne doit importer QUE `takeSystemSnapshot` de ce dossier. Tout le reste est interne.
