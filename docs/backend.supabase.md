# 🗄️ Backend & Automatisation — Supabase
**Version** : 1.1.0
**Status** : INFRASTRUCTURE GUIDE

## 🏗️ Structure Cloud
Le système repose sur Supabase (PostgreSQL) et Resend pour l'orchestration des flux sortants.

### Tables Critiques
*   `public.clients` : Base de données prospects. Unicité par email.
*   `public.studies` : Détails techniques et financiers des études. Liée à `clients`.
*   `public.email_queue` : La file d'attente intelligente pour les séquences automatiques.
*   `public.decision_logs` : La "Boîte Noire" enregistrant chaque action forcée par l'humain.

## 🚀 L'Automate (Job n°7)
Un cron job est configuré pour s'exécuter chaque matin à **9h00**.
*   **Action** : Déclenchement de l'Edge Function via `auth.http_post`.
*   **Logic** : Envoie tous les emails dont le statut est `pending` et dont la date prévue est échue.

## 🎯 Séquences Automatiques
### 1. Post-Signature (Anti-Annulation)
Séquence de 5 à 6 emails sur 14 jours visant à renforcer la confiance et sécuriser l'acompte.
*   **J+1** : Confiance & Légitimité.
*   **J+2** : Expertise & Optimisation.
*   **J+3** : Rappel de sécurité (Tarifs).
*   **J+5** : Suivi acompte.

### 2. Post-Refus (Récupération)
Séquence de 4 emails visant à clarifier les doutes et offrir une dernière chance de signature.

## 🧪 Maintenance & Diagnostic
### Vérifier les erreurs
```sql
SELECT email_type, status, last_error 
FROM public.email_queue 
WHERE status = 'error';
```

### Forcer le passage de l'automate (Test)
```sql
DO $$ 
BEGIN
    UPDATE email_queue 
    SET scheduled_for = NOW() - INTERVAL '1 minute' 
    WHERE status = 'pending';
    
    EXECUTE (SELECT command FROM cron.job WHERE jobid = 7);
END $$;
```

---
*Géré par Nicolas Di Stefano. Ne pas supprimer les clés d'API dans les variables d'environnement Vercel/Supabase.*
