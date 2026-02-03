# Patch Notes & Checklist d'acceptation — Patch P0 (Brain load + logging)

Résumé du patch P0
- Objectif : corriger la race condition de chargement (useSystemBrain), garantir la persistance des logs décisionnels (insert await), protéger les `.in()` queries.
- Changements proposés (non‑destructifs) :
  - `src/brain/Engine.ts` : suppression de l'appel non‑awaité `logDecision(...)` (Engine reste purement calcul).
  - `src/brain/useSystemBrain.ts` : refactor loadData pour charger `studies` + `email_leads` en parallèle, charger `tracking_events` et `email_queue` conditionnellement, construire statsMap, mapper `mappedStudies`, appeler `buildSystemBrain`, et effectuer un `INSERT` awaited contrôlé dans `decision_logs` si `priorityCase` détecté.
  - Protections sur `.in()` : skip si liste vide, prévoir batch si ids grandes.

Instructions de déploiement local (staging)
1. Sauvegarde fichiers :
   - `cp src/brain/Engine.ts src/brain/Engine.ts.bak`
   - `cp src/brain/useSystemBrain.ts src/brain/useSystemBrain.ts.bak`
2. Appliquer patch (voir fichier `fix-brain-load-and-logs.patch` si fourni).
3. Lancer build & tests :
   - `npm ci`
   - `npm run build`
   - `npm run test` (si tests présents)
4. Exécuter la version sur staging ( `npm run dev` ) et faire les vérifications ci‑dessous.

Checklist d'acceptation (manuelle, à cocher)
- [ ] Build TypeScript passe sans erreurs.
- [ ] `useSystemBrain` charge et setMetrics sans console.error.
- [ ] Si une `priorityCase` est identifiée pendant `refresh()`, une ligne `PRIORITY_CASE_FLAGGED` apparaît dans `decision_logs` (vérifier via Supabase UI).
- [ ] Aucune écriture (UPDATE/DELETE) sur `studies` / `clients` inattendue pendant tests.
- [ ] Tracking counts (opens/interactions) augmentent à l'ouverture de GuestView.
- [ ] War Room affiche les dossiers prévus (dangerScore >= 60) comme avant et prioritéCase concorde.
- [ ] UI ne freeze pas (aucun prompt/confirm bloquant depuis hook).
- [ ] Logs d'erreur liés aux requêtes `.in()` ont disparu pour cas `studyIds.length === 0`.
- [ ] Performance acceptable (chargement < threshold standard local).
- [ ] **Operator Certification** :
    - [ ] Badge "Certifié" (100%) visible dans le header au démarrage.
    - [ ] En cas de clic hors séquence (vs Agent Zero), le score baisse (-15%) et le badge change de couleur.
    - [ ] L'appel `/audit` est bien envoyé en fin de session avec le score final.
- [ ] **Integration SpeechView v1.1** :
    - [ ] Mode "DÉFIANCE" n'est plus forcé par défaut pour tous les seniors (fix: hardcoding removed).
    - [ ] Les vraies données SpeechView (modes, signals, alerts) sont transmises à Agent Zero.
    - [ ] **Mode OPPORTUNITÉ** : Logique stricte rétablie (Standard + 0 alertes + 0 signaux négatifs = opportunity: true).
    - [ ] Console logs affichent "📦 PAYLOAD ENVOYÉ" avec les données réelles.

KPIs à monitorer (définitions & sources)
- **Closing Net** : taux de dossiers signés définitivement après J+14.
  - Formule : (Nb dossiers signed et non annulés J+14) / (Nb dossiers signed) * 100
  - Source : `studies` (status + signed_at + cancelled flag)
  - Target initial : +28–32% improvement vs baseline (mesurer avant/après).
- **Annulations J+7** :
  - Formule : (Nb dossiers annulés with cancellation_date <= signed_at + 7d) / (Nb dossiers signed) * 100
  - Target : < 7%
- **CA exposé vs CA sécurisé** :
  - CA_expose = SUM(total_price WHERE status='signed' AND deposit_paid=false)
  - CA_secure = SUM(deposit_amount WHERE deposit_paid=true)
  - Source : `studies` / `payments`
- **Time to secure deposit** :
  - Median(signed_at → deposit_paid_at)
  - Source : `studies.deposit_paid_at`
- **Open/Click engagement** :
  - Opens_first7days per study, Clicks_first7days
  - Source : `tracking_events` filtered by created_at <= signed_at + 7d
- **War Room action success** :
  - % dossiers en War Room qui passent à deposit_paid=true dans X jours post action (ex: 7d)
  - Source : `decision_logs` (action_performed) + `studies`

Rollout recommendation
- Appliquer en staging d'abord.
- Monitorer KPIs hebdomadaire pendant 4 semaines.
- Si tout OK, merge sur main et déployer en prod avec feature flag (si possible).
