# SÉCURITÉ & CONFORMITÉ RGPD

> Ce document décrit les mesures techniques et organisationnelles pour protéger les données clients (PII) et le chiffre d'affaires.

---

## 1. Protection des Données (RGPD)

### Données Personnelles (PII)
Les tables `clients` contiennent des données sensibles :
*   Nom, Prénom, Email, Téléphone.
*   Adresses (via `studies.study_data.address`).

**Actions de conformité :**
*   **Opt-out** : Le champ `client.email_optout` est souverain. S'il est `true`, le système ne doit PLUS envoyer d'email ni tracker les ouvertures.
*   **Droit à l'oubli** : Une procédure manuelle permet de supprimer un client (`DELETE FROM clients WHERE id = ...` cascade vers studies).
*   **Minimisation** : Les logs techniques (`tracking_events`) ne stockent pas d'IP clear text, uniquement un hash salé si nécessaire pour la déduplication.

### Droit de Rétractation (Loi Hamon / Conso)
*   Tout contrat signé hors établissement a un délai de rétractation de 14 jours.
*   Le système doit tracer la date de signature (`signed_at`) avec précision pour calculer ce délai.
*   Les emails anti-annulation pendant cette période doivent être informatifs et rassurants, sans constituer une "pression commerciale agressive".

---

## 2. Sécurité Applicative

### Row Level Security (RLS)
Supabase force l'authentification.
*   Les commerciaux ne voient que leurs dossiers (`auth.uid() = owner_id`).
*   Les managers voient tout (rôle `admin`).
*   L'API publique n'est pas exposée directement (sauf pour GuestView via token).

### Gestion des Secrets
*   Les clés d'API (Supabase Service Key, SMTP provider) sont stockées dans les **Variables d'Environnement** (`.env` local, Secrets Vault en prod).
*   Jamais committées dans le repo.

---

## 3. Architecture GuestView (Accès Public)

Le module GuestView permet à un client de voir son étude sans se connecter. C'est un point d'entrée critique.

**Mécanisme Sécurisé :**
1.  On ne passe PAS l'ID séquentiel ou UUID brut dans l'URL (risque d'énumération).
2.  On utilise un champ dédié `guest_view_token` (string aléatoire cryptographique) ou un UUID v4 distinct.
3.  L'URL est de forme : `https://dashboard.edf-enr.com/guest/{guest_view_token}`.
4.  **Backend Verification** : Une Edge Function (ou RLS policy avec `security definer`) vérifie que le token existe et n'est pas expiré.
5.  **Expirations** : Le lien est valide 30 jours après envoi (configurable).

**Risques Mitigés :**
*   **Brute force token** : Rate limiting sur l'endpoint GuestView.
*   **Fuite de données** : La page GuestView affiche des données *read-only* et *limitées* (pas de données techniques internes ou de marge commerciale).

---

## 4. Politique de Log & Audit

Le système maintient une traçabilité forte (`decision_logs`) pour :
*   Prouver la validité d'une signature (timestamp, IP, consenti).
*   Justifier les actions automatiques (pourquoi ce dossier est passé en War Room).
*   Ces logs sont **immutables** (INSERT only, pas de DELETE autorisé pour les logs).
