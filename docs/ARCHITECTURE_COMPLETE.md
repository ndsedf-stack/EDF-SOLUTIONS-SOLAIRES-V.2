# AUTOPILOTE SOLAIRE — Architecture Complète & Algorithmes

Résumé
- Produit : Autopilote Solaire — système complet de vente terrain + protection du CA.
- Objectif principal : Augmenter le CLOSING NET (signatures qui tiennent), réduire annulations J+7.

Diagramme de haut niveau (mermaid)
```mermaid
graph TD
  A[ResultDashboard] -->|create study| B[Supabase: studies]
  B --> C[Email Engine / email_queue]
  C --> D[Client (GuestView / Email)]
  D -->|view/click| E[Supabase: tracking_events]
  E --> F[Brain Ingestion (useSystemBrain)]
  F --> G[Engine.buildSystemBrain]
  G --> H[Dashboard / War Room / Pilotage]
  H --> I[Actions humaines & Email Engine]
  I -->|logs| J[Supabase: decision_logs]
```

Composants & rôle

ResultDashboard (terrain) : création étude, projection financière, génération guest_view_url.
GuestView : vue client publique/privée de l’étude, enregistre view/click.
Tracking : table tracking_events (events: email_open, view, email_click, click, download, sign_intent).
Brain (hook useSystemBrain) : ingestion, déduplication tracking, mapping études.
Engine (buildSystemBrain) : calculs (Danger Score, cancellationRisk, tensionLevel, priorityCase, priorityActions).
Email Engine : séquences anti‑annulation / post‑refus / nurture.
War Room : interface d’action priorisée (signed && deposit non payé).

Schéma simplifié des tables (utilisées)

studies: id, client_id, status, install_cost (alias total_price), deposit_paid, deposit_amount, signed_at, study_data, guest_view_url
clients: id, first_name, last_name, email, phone, email_optout
email_queue: study_id, client_id, email_type, status, sent_at, scheduled_for, created_at
email_leads: client_id, email_step, total_opens, total_clicks, next_email_scheduled_at
tracking_events: study_id, event_type, created_at, meta
decision_logs: study_id, action_performed, justification, created_at

Algorithmes clés (résumé opérationnel)

Danger Score (0–100):
Inputs: daysSinceSigned, total_price(normalized), engagementScore (opens/clicks/last_open), deposit_paid boolean.
Pseudocode:
timeFactor = clamp((signed_age_days / 14) * 100, 0, 100)
valueFactor = normalize(total_price) * 100
engagementFactor = (1 - engagementNormalized) * 100
danger = clamp( w_time * timeFactor + w_value * valueFactor + w_eng * engagementFactor, 0, 100 )
default weights: w_time=0.45, w_value=0.30, w_eng=0.25 (configurable)

Cancellation Risk:
combine Danger Score + TensionLevel + BehaviorCategory
computeCancellationRisk({dangerScore, tensionLevel, behavior}) => value 0..1

PriorityCase:
select signed && !deposit_paid && (dangerScore >= 60 OR total_price > highValueThreshold)
rank by (cancellationRisk * total_price)

Dedup Tracking:
de‑dupe events per study per window (config: TRACK_DEDUP_SECONDS default 60–90)
count opens per window to compute total_opens

War Room Rules (operational)

Entry conditions:
status === 'signed' && deposit_paid === false && (dangerScore >= 60 OR total_price > X)
Actions:
call client (script), send RIB + confirmation, escalate to manager, schedule immediate follow up email (anti‑annulation).
Logging:
every action must be appended to decision_logs with justification (audit trail).

Sécurité, RGPD & infra notes

Respecter client.email_optout to prevent email sends.
GuestView links : expiration configurable; tokenized URL (short TTL recommended).
Indexes recommandés : indexes sur study_id, client_id et created_at pour tracking_events et email_queue.
Jobs : pg_cron pour wake-up du Email Engine / scheduled tasks.

Tests recommandés

Unit tests: Danger Score boundaries, cancellationRisk extremes, priorityCase selection.
Integration tests: simulate a signed study -> no deposit -> generate tracking events -> confirm War Room selection and decision_logs insert.
Staging: full smoke test with realistic datasets.

Change log summary (à date)

Refonte Brain load order (useSystemBrain) recommandée pour éviter race condition.
Déplacement du logDecision pour persistance awaitée.
Protections sur .in() queries, dedup window paramétrable.
