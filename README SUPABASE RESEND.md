README — Résumé complet du travail et de l’architecture
Ce document rassemble, de manière exhaustive et organisée, tout ce que nous avons réalisé ensemble dans le projet (opérations SQL, décisions, erreurs rencontrées, architecture de données et bonnes pratiques). Gardez ce README comme référence : dans un mois vous pourrez relire ce fichier et retrouver les informations essentielles sans rien oublier.

Important : ce README couvre uniquement les actions et la structure liées à la base de données Supabase/Postgres et aux opérations que nous avons effectuées. Il ne contient pas de secrets (clés, mots de passe) ni de liens sensibles.

Contexte général du projet
Projet Supabase : ugwqfvwclwctzgtxcakp (identifiant projet fourni par l’assistant).
Schémas disponibles (liste récupérée automatiquement) :
pgbouncer, realtime, extensions, vault, graphql_public, graphql, auth, storage, public, net, supabase_functions, cron
Objectif des opérations récentes : gérer des clients et créer des études liées à ces clients (insertion/upsert, création d’une étude marquée "envoyée").
Actions réalisées (chronologie et détails techniques)
Upsert (INSERT ON CONFLICT DO UPDATE) dans public.clients

Email utilisé : sxmwings@hotmail.com [blocked]
Valeurs insérées / mises à jour :
email: sxmwings@hotmail.com [blocked]
phone: 0615482234
first_name: Nicolas
last_name: Di Stefano
city: Cannes
Résultat retourné (champ important) :
id: b1113940-d407-44a9-b9eb-011468365f29
created_at: 2026-01-03 13:08:38.323752+00
updated_at: 2026-01-03 13:08:38.323752+00
Remarques :
La requête a utilisé la contrainte d’unicité sur email (ON CONFLICT (email)).
Si vous avez besoin d’autres colonnes (addresses, metadata, tags), on peut afficher l’enregistrement complet.
Tentative d’insertion d’une étude dans la table studies

Requête souhaitée (valeurs fournies) :
client_id: b1113940-d407-44a9-b9eb-011468365f29
study_data: JSON contenant données de l’étude (nom, énergie, production, coûts, garanties, etc.). Exemple complet : {"n":"Nicolas Di Stefano","e":32202,"prod":7000,"conso":10000,"selfCons":70,"installCost":18799,"m":139,"t":3.89,"d":180,"mode":"financement","elecPrice":0.25,"installedPower":3.5,"projectionYears":20,"cashApport":0,"ga":["🏆 Garantie Performance 30 ans","Garantie main d''œuvre À VIE","SAV et maintenance inclus"]}
status: 'sent'
guest_view_url: 'https://nicolas-distefano-edf.fr'
expires_at: NOW() + INTERVAL '7 days'
Erreur rencontrée lors de l’insertion :
ERROR: 42703: column "client_id" of relation "studies" does not exist
Analyse de l’erreur :
La table studies n’a pas de colonne nommée client_id dans le schéma public (ou la table n’existe pas). Possibilités :
Le nom de la colonne est différent (par ex. client, client_uuid, customer_id, owner_id).
La table studies est dans un autre schéma.
La table studies utilise un JSONB contenant la référence au client (ex. study_data.client).
Action recommandée (à faire maintenant ou plus tard) :
Lister les colonnes de la table studies pour corriger l’INSERT.
Alternative : fournir le CREATE TABLE ou préciser le nom du champ qui référence le client.
Je peux exécuter une requête pour décrire la table (SHOW COLUMNS / SELECT from information_schema.columns). Confirmez si vous voulez que je lance cette lecture.
Schéma des tables impliquées (état attendu / hypothèse)
Table public.clients (colonnes attendues, inferred):

id (uuid) — PK
email (text, unique)
phone (text)
first_name (text)
last_name (text)
city (text)
created_at (timestamp with time zone)
updated_at (timestamp with time zone)
Remarques : l’upsert a fonctionné donc ces colonnes existent et email est unique.
Table public.studies (structure inconnue / à vérifier)

Ce qu’on voulait insérer :
client_id (uuid) — FK vers clients.id [ÉCHEC car colonne absente]
study_data (jsonb) — bloc JSON avec la configuration de l’étude
status (text) — ex: 'sent'
guest_view_url (text)
expires_at (timestamptz)
created_at, updated_at (timestamps) probablement présents
Vérifier si la colonne qui référence client s’appelle différemment (ex. client, client_uuid, customer_id) ou si la relation est modélisée autrement (jointable).
Données insérées (exemples)
Client inséré / mis à jour :

id: b1113940-d407-44a9-b9eb-011468365f29
email: sxmwings@hotmail.com [blocked]
phone: 0615482234
first_name: Nicolas
last_name: Di Stefano
city: Cannes
created_at / updated_at: 2026-01-03 13:08:38.323752+00
Etude (tentative) — payload JSON envoyé : { "n":"Nicolas Di Stefano", "e":32202, "prod":7000, "conso":10000, "selfCons":70, "installCost":18799, "m":139, "t":3.89, "d":180, "mode":"financement", "elecPrice":0.25, "installedPower":3.5, "projectionYears":20, "cashApport":0, "ga":["🏆 Garantie Performance 30 ans","Garantie main d'œuvre À VIE","SAV et maintenance inclus"] }

Remarque sur l’encodage : lors de l’insertion SQL, les apostrophes dans des chaînes doivent être échappées en doublant (ex. main d''œuvre). Dans le JSON stocké en JSONB, vous pouvez utiliser l’UTF-8 normal (œ) sans échappement.

Points d’architecture et recommandations de modélisation
Références relationnelles :
Utilisez des clés étrangères explicites (FOREIGN KEY (client_id) REFERENCES clients(id)) pour maintenir l’intégrité relationnelle.
Si la table studies doit référencer un client, standardisez le nom de colonne : client_id (uuid) est recommandé.
Types et colonnes :
Préférez JSONB pour le champ study_data (indexable via GIN si besoin).
Indexez : clients.email (unique), studies.client_id, studies.expires_at si vous interrogez souvent par date.
RLS & sécurité :
Activez RLS sur tables sensibles si vos utilisateurs se connectent via Supabase Auth.
Créez des policies pour que seuls les utilisateurs autorisés puissent créer/voir des études.
Utilisez auth.uid() dans les policies pour lier les données à l’utilisateur connecté lorsque nécessaire.
Audit :
Ajoutez created_at / updated_at via triggers ou DEFAULTs (now()) et un trigger pour updated_at.
Optionnel : table audit_logs ou extension pg_audit pour tracer changements critiques.
Prochaines étapes recommandées (actionnable)
Vérifier la structure de la table studies :
Je peux exécuter (lecture) : SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'studies';
Ou : \d public.studies (selon l’outil). Dites-moi si j’exécute la requête maintenant.
Corriger et exécuter l’INSERT pour créer l’étude :
Une fois le nom exact de la colonne client_id connu, j’exécute l’INSERT correctement.
Ajouter contrainte FK si nécessaire :
ALTER TABLE studies ADD COLUMN client_id uuid;
ALTER TABLE studies ADD CONSTRAINT fk_studies_clients FOREIGN KEY (client_id) REFERENCES public.clients (id);
(Demander confirmation avant toute modification DDL destructive ou structurelle.)
Ajouter index sur studies(expires_at) si vous gérez expiration et purge automatique.
Implémenter un trigger ou tâche CRON (pg_cron) pour supprimer/archiver études expirées :
Exemple : DELETE FROM studies WHERE expires_at < NOW();
Ou mettre un champ status = 'expired' via un job programmé.
Tests :
Tester l’INSERT en tant qu’utilisateur authentifié si RLS actif.
Vérifier que l’upsert pour clients ne casse pas les contraintes uniques (email).
Bonnes pratiques et notes pour dans un mois
Sauvegardes : gardez des sauvegardes régulières (snapshots) avant les migrations DDL.
Migrations : gérez les changements de schéma via un outil de migrations (pg-migrate, supabase migrations).
Documentation : conservez ce README dans votre repo (README_db.md) et mettez à jour à chaque modification de schéma.
Données sensibles : ne stockez pas d’informations sensibles non chiffrées dans study_data si nécessaire (ex. numéros de sécurité sociale).
Tests de régression : ajoutez des tests unitaires pour les mutations principales (create/update clients, create studies).
Monitoring : activez les advisors/get_advisors régulièrement pour sécurité/performance.
Commandes SQL utiles (prêtes à exécuter)
Lister colonnes de studies (lecture) : SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'studies' ORDER BY ordinal_position;
Exemple d’INSERT corrigé (à adapter si la colonne client_id existe) : INSERT INTO public.studies (client_id, study_data, status, guest_view_url, expires_at) VALUES ( 'b1113940-d407-44a9-b9eb-011468365f29', '<JSONB_PAYLOAD>', 'sent', 'https://nicolas-distefano-edf.fr', NOW() + INTERVAL '7 days' ) RETURNING id;
Ajouter colonne client_id (si manquante) : ALTER TABLE public.studies ADD COLUMN client_id uuid;
Ajouter contrainte FK : ALTER TABLE public.studies ADD CONSTRAINT fk_studies_clients FOREIGN KEY (client_id) REFERENCES public.clients (id);
Note : je n’exécute aucune commande DDL sans votre confirmation explicite.

Logs et erreurs à surveiller
Erreur rencontrée : colonne manquante (42703) — vérifier noms de colonnes / schémas.
Si d’autres erreurs surviennent lors d’INSERT/UPDATE, vérifier :
types (ex. JSON vs JSONB),
contraintes NOT NULL,
triggers BEFORE INSERT qui peuvent rejeter la ligne,
policies RLS bloquant l’opération (auth.uid()).
Résumé rapide et checklist (pour lecture dans un mois)
 Client upsert effectué pour sxmwings@hotmail.com [blocked] (id b1113940-...)
 Étude "sent" : tentative effectuée, erreur — colonne client_id manquante dans studies
 Vérifier structure de studies (information_schema.columns)
 Adapter INSERT ou ajouter colonne/contrainte FK
 Ajouter indexes/cron/trigger si nécessaire
 Mettre en place RLS/policies si accès via Supabase Auth
 Mettre en place audit et sauvegardes