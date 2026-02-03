# DATABASE SCHEMA — SUPABASE (PROD)
> Dernière mise à jour : Janvier 2026
> Statut : Production

Ce document détaille la structure de la base de données utilisée par le système Autopilote.

---

## 🏗️ Tables Principales

### `studies`
Table pivot. Contient les données contractuelles, financières et l'état d'avancement.

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | Clé primaire. |
| `client_id` | `uuid` | - | FK vers `clients.id`. |
| `status` | `text` | `'draft'` | Enum: `draft` \| `sent` \| `signed` \| `cancelled`. |
| `install_cost` | `numeric` | `0` | Montant total TTC du projet (alias `total_price` dans le code). |
| `deposit_amount` | `numeric` | `0` | Montant de l'acompte attendu/versé. |
| `deposit_paid` | `boolean` | `false` | Si `true`, le CA est sécurisé. |
| `deposit_paid_at`| `timestamptz`| `null` | Date de sécurisation de l'acompte. |
| `signed_at` | `timestamptz`| `null` | Date de signature du contrat (= début période rétractation). |
| `created_at` | `timestamptz`| `now()` | Date de création de l'étude. |
| `study_data` | `jsonb` | `{}` | Données techniques (toiture, calepinage, adresse). |
| `guest_view_token`| `text` | - | Token unique pour l'accès public GuestView. |
| `guest_view_expires_at`| `timestamptz`| - | Date d'expiration du lien invité. |

### `clients`
Données PII (Personnellement Identifiables).

| Column | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `uuid` | `gen_random_uuid()` | Clé primaire. |
| `first_name` | `text` | - | Prénom. |
| `last_name` | `text` | - | Nom. |
| `email` | `text` | - | Email (unique constraint). |
| `phone` | `text` | - | Téléphone normalisé (+33...). |
| `email_optout` | `boolean` | `false` | Si `true`, exclusion de tout marketing/tracking (RGPD). |

### `tracking_events`
Table de haute vélocité (Event Sourcing). Enregistre chaque interaction.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | PK. |
| `study_id` | `uuid` | FK vers `studies.id`. |
| `event_type` | `text` | Enum: `email_open` \| `email_click` \| `guest_view` \| `download_pdf` \| `sign_intent`. |
| `created_at` | `timestamptz`| Moment exact de l'action. |
| `meta` | `jsonb` | Payload contextuel (user_agent, ip_hash, section_viewed). |

**Note sur la performance** : Table partitionnée par range de dates en production (TODO).

### `email_queue`
File d'attente pour le moteur d'emails transactionnels.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | PK. |
| `study_id` | `uuid` | FK vers `studies.id`. |
| `client_id` | `uuid` | FK vers `clients.id`. |
| `email_type` | `text` | Template ID (ex: `anti_annulation_j3`, `welcome_pack`). |
| `status` | `text` | Enum: `pending` \| `sent` \| `failed` \| `cancelled`. |
| `scheduled_for`| `timestamptz`| Date d'envoi prévue (ex: signed_at + 3 days). |
| `sent_at` | `timestamptz`| Date réelle d'envoi (pour audit). |

### `decision_logs`
Audit Trail des actions automatiques et manuelles (War Room).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | PK. |
| `study_id` | `uuid` | Ciblage du dossier. |
| `action_performed`| `text` | Ex: `PRIORITY_CASE_FLAGGED`, `EMAIL_SENT`, `STATUS_UPDATE`. |
| `justification` | `text` | Raison de l'action ("Danger Score > 80", "Manual override"). |
| `created_at` | `timestamptz`| Date de l'action. |

---

## 🔒 Security Policies (RLS)

Toutes les tables ont RLS (Row Level Security) activé.
*   `anon` : Pas d'accès (sauf function RPC spécifique).
*   `authenticated` : Select/Insert/Update selon owner `user_id` (lié à `auth.users`).
*   `service_role` : Accès admin (utilisé par les Edge Functions / Cron Jobs).

## 🚀 Indexes Recommandés

```sql
CREATE INDEX idx_studies_client_id ON studies(client_id);
CREATE INDEX idx_tracking_study_created ON tracking_events(study_id, created_at DESC);
CREATE INDEX idx_queue_status_scheduled ON email_queue(status, scheduled_for) WHERE status = 'pending';
```
