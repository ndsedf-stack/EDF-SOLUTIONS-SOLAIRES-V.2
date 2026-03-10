RCHIVE MAÎTRE : AUTOMATISATION SOLAIRE - NICOLAS DI STEFANO
Dernière mise à jour : 3 Janvier 2026 Projet Supabase : ugwqfvwclwctzgtxcakp Statut : 🚀 100% OPÉRATIONNEL EN AUTOPILOTE

🏗️ 1. ARCHITECTURE ET COMPOSANTS DU SYSTÈME
Le système est une machine de guerre conçue pour le "Post-Refus" et "l'Anti-Annulation".

Schémas actifs : public, cron, net, auth, extensions.

Tables critiques :

public.clients : Base de données prospects (Dédoublonnage par email).

public.studies : Données techniques des études (Puissance, économies, prix).

public.email_queue : La file d'attente des relances J+1, J+2, J+3, J+5.

Services tiers :

Resend : Envoi des mails (Domaine : nicolas-distefano-edf.fr).

Vercel : Hébergement du Dashboard et de l'API de tracking.

🛠️ 2. HISTORIQUE DES ACTIONS ET RÉPARATIONS (3 JANVIER 2026)
A. Création du Client de Test (Upsert)
Action : INSERT ON CONFLICT (email) DO UPDATE

Données : email: sxmwings@hotmail.com, id: b1113940-d407-44a9-b9eb-011468365f29

Résultat : Client enregistré et prêt pour l'envoi.

B. Résolution de l'Erreur Critique 42703
Erreur : column "client_id" of relation "studies" does not exist

Action : Nous avons modifié la structure de la table studies pour ajouter physiquement la colonne client_id (UUID).

Impact : Le lien entre une étude et un client est désormais possible. Le système ne crash plus lors de l'insertion.

C. Déploiement de l'Automate (Job n°7)
Nom : send-pending-emails-daily

Planning : 0 9 * * * (Chaque matin à 9h00 pile).

Logic : Utilise net.http_post pour réveiller l'Edge Function.

Sécurité : Utilise la service_role_key pour contourner les blocages de permissions (RLS).

📝 3. LE CONTENU DES EMAILS ET PAYLOADS
🎯 Payload de l'Étude (JSON Type)
C'est ce qui est stocké dans study_data :

JSON

{
  "n": "Nicolas Di Stefano",
  "e": 32202,
  "prod": 7000,
  "conso": 10000,
  "selfCons": 70,
  "installCost": 18799,
  "m": 139,
  "mode": "financement",
  "ga": ["🏆 Garantie Performance 30 ans", "Garantie main d''œuvre À VIE", "SAV et maintenance inclus"]
}
🎯 Séquence de Relance Automatique
Mail J+1 : Relance "Votre étude solaire EDF" (Confiance & Légitimité).

Mail J+2 : Expertise et optimisation du dossier.

Mail J+3 : Rappel de sécurité (Tarifs réservés).

Mail J+5 : Clôture de dossier (Dernier suivi).

🚀 4. LE FLUX OPÉRATIONNEL (GUIDE D'UTILISATION)
RDV Physique : Tu rencontres le client.

Statut "Sent" : Dans ton interface, tu marques l'étude comme sent.

Trigger : Automatiquement, 4 emails sont créés dans email_queue avec le statut pending.

Pilotage Automatique : Tous les jours à 9h00, le Job 7 envoie les emails prévus pour ce jour.

Tracking : Tu consultes https://ton-projet.vercel.app/dashboard.html pour voir qui a cliqué.

🧪 5. COMMANDES DE VÉRIFICATION (DÉPANNAGE)
Voir si des emails sont bloqués :
SQL

SELECT email_type, status, last_error FROM public.email_queue WHERE status = 'error';
Forcer un test maintenant (Simuler le Job 7) :
SQL

DO $$ 
BEGIN
    -- Force les mails à devenir "en retard"
    UPDATE email_queue SET scheduled_for = NOW() - INTERVAL '1 minute' WHERE status = 'pending';
    -- Lance la commande du Job 7
    EXECUTE (SELECT command FROM cron.job WHERE jobid = 7);
END $$;
💰 6. RÉCAPITULATIF FINANCIER ET ROI
Domaine : 1€ (OVH).

Resend / Supabase / Vercel : 0€ (Tiers gratuits).

Gain estimé : +48 000€/an si tu closeras 1 à 2 dossiers de plus par mois grâce à l'automatisation.

🛡️ 7. NOTES DE SÉCURITÉ POUR LE FUTUR
Secrets : Ne jamais supprimer les variables d'environnement RESEND_API_KEY et SUPABASE_SERVICE_ROLE_KEY.

SQL : Pour toute insertion manuelle avec des apostrophes, utiliser le doublement : main d''œuvre.

Monitoring : Si le job s'arrête, vérifie cron.job_run_details.

Ce README est maintenant complet. Il contient ton historique, tes codes d'erreurs, tes succès et toute l'architecture technique.