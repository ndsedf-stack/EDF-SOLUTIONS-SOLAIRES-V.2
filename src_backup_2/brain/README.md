# Brain — `useSystemBrain` & `Engine` — Documentation rapide

But
Le Brain est la couche d'ingestion et d'orchestration : il collecte `studies`, `email_leads`, `tracking_events`, `email_queue` et prépare les objets consommés par le `Engine` pour produire métriques & recommandations.

Fichiers clés
- `src/brain/useSystemBrain.ts` : hook React / orchestration Supabase, construit `mappedStudies` et expose `metrics`.
- `src/brain/Engine.ts` : logique statique de calcul (Danger Score, War Room, priorityActions).
- `src/brain/types.ts` : types Study, Metrics, EmailLead.
- `src/brain/signals/mappers.ts` : mapping d'une row `study` vers objet display (ajout des stats tracking).
- `src/brain/decision/*` : utilitaires de recommandation & memory/logging.

Inputs & Outputs
- Input principal : tableaux `studies` enrichis de `stats` (email_opens, interactions, last_open, last_click).
- Output principal : `Metrics` { warRoom, finance, actionNow, behavioral, systemState, priorityCase, priorityActions, urgencyMode, financialStats }

Points critiques à vérifier
- Order of load: toujours charger `email_leads` et `tracking_events` AVANT mapping final pour garantir stats.
- Tracking dedup: configurable via `TRACK_DEDUP_SECONDS`.
- Logging: la persistance des décisions **doit** être awaitée (faire INSERT depuis le hook async, pas depuis Engine synchrone).

How to read metrics
- `metrics.warRoom.studies`: liste de dossiers en War Room (avec `dangerScore`, `cancellationRisk`).
- `metrics.priorityCase`: dossier prioritaire identifié (id, dangerScore, action).
- `metrics.financialStats`: synthèse CA exposé vs sécurisé.

Opérations exposées (actions)
- `actions.updateStudyStatus(id, status, name, reason)` — met à jour status (utiliser modale UI pour confirmer).
- `actions.signStudy(studyId, studyName)` — wrapper UI pour confirmer signature (fonctionne en dev avec confirm).
- `actions.markDepositPaid(id, name)` — confirmer paiement (à convertir en modal).
- `actions.refresh()` — relancer ingestion / recalcul brain.

Conseils d'évolution
- Extraire l'INSERT des logs avec guard anti‑spam (ex : only one PRIORITY_CASE_FLAGGED entry per study per 24h).
- Ajouter types stricts pour `WarRoomStudy` et supprimer `as any`.
- Ajouter tests unitaires pour fonctions `computeDangerScore`, `computeCancellationRisk`.
