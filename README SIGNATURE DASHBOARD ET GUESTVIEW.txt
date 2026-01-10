📘 README — Système d’études, signature & GuestView
🎯 Objectif produit
Mettre en place un système propre et robuste pour gérer :
🧾 des études EDF générées chez le client (ResultsDashboard)
✍️ leur signature officielle
🔐 leur verrouillage
📱 un GuestView temporaire uniquement quand le client n’a pas signé
🧠 un cockpit commercial qui distingue clairement :
leads OCR
études envoyées
études signées
Le but est de couvrir tout le cycle commercial :
OCR → Étude → GuestView → Signature → Sécurisation → Anti-annulation → Cockpit.
🧱 Architecture actuelle
Frontend
ResultsDashboard
→ chez le client, génération étude, signature, sécurisation, export, QR code.
GuestView
→ accès temporaire à une étude non signée.
Dashboard / Cockpit
→ vision commerciale (pilotage, statuts, relances, couleurs).
Backend (Supabase)
Tables clés :
studies
champ	rôle
id	ID officiel de l’étude
status	draft / signed / cancelled
signed_at	date signature
expires_at	fin de validité guest
guest_view_url	lien public
client_*	infos client
commercial_*	infos vendeur
study_data	payload complet étude
decision_logs
Trace métier inviolable.
Exemples :

SIGNED_FROM_RESULTS_DASHBOARD
CANCELLED
email_schedules
Scénarios automatiques post-signature :
anti_j0
anti_j3
anti_j7
anti_j14
(= moteur anti-annulation)
clients
Clients OCR / CRM.
✅ Ce qui est maintenant EN PLACE
1️⃣ Génération d’étude (ResultsDashboard)
Quand on clique “Transmettre synthèse” :
insertion dans studies
récupération de l’ID Supabase officiel
génération du guest link basé sur cet ID
update de guest_view_url
stockage dans le state React (currentStudyId)
affichage QR + lien
👉 À ce stade :
étude = draft
GuestView autorisé
valable X jours
2️⃣ Signature officielle client
Bouton “Sécurisation du dossier EDF” fait maintenant :
update studies.status = signed
écrit signed_at
crée une ligne dans decision_logs
déclenche l’écriture des séquences email
passe isSigned = true côté UI
👉 C’est l’ACTE COMMERCIAL OFFICIEL.
3️⃣ Verrouillage UX
Dès qu’une étude est signée :
bouton sécurisé devient grisé / inactif
plus possible de signer 2 fois
plus possible de générer GuestView
message “Client signé / dossier sécurisé”
Et au rechargement :
on relit Supabase
on remet automatiquement isSigned = true
👉 Donc aucun contournement possible.
4️⃣ Séparation des rôles
Cas	Statut	Droit
Lead OCR	pas d’étude	cockpit only
Étude envoyée	draft	GuestView autorisé
Client signé	signed	GuestView bloqué, emails actifs
🔄 Logique métier officielle
OCR / Lead
   ↓
Génération étude
   ↓
draft + GuestView (7j)
   ↓
Signature client
   ↓
signed + verrouillage + emails
   ↓
cockpit = client signé
🧠 Principes qui ne doivent PLUS être cassés
❌ Une étude signée ne redevient jamais guest.
❌ Le guest n’est jamais une signature.
❌ Une signature = un événement unique loggé.
❌ Le cockpit lit Supabase, jamais le front.
❌ Toujours utiliser l’ID généré par Supabase.
❌ Tous les états passent par studies.status.
🧩 Ce qu’il reste à faire
A — Cockpit commercial
Colonnes séparées :
Leads OCR
Études envoyées
Clients signés
Couleurs :
⚫ lead
🟡 étude draft
🟢 signé
Actions cockpit :
voir étude
annuler
renvoyer guest
noter client
timeline depuis decision_logs
B — Sécurité GuestView
Bloquer si :
study.status ≠ draft
expires_at < now()
Afficher écran :
“Cette étude est expirée”
“Client déjà engagé”
C — UX client signé
Écran “Projet sécurisé”
badge verrou 🔒
résumé contrat
prochaine étape
aucun bouton d’export
D — Sécurité backend
RLS Supabase :
guest = lecture limitée
signed = plus rien
insert logs uniquement serveur
éventuellement une table :
study_events (timeline)
E — Automatisation avancée
cron qui :
expire études
alerte commerciales
coupe liens
scoring pipeline
🛠 Règles de dev à respecter
Avant toute feature :
toujours identifier :
étude ? lead ? guest ? signé ?
toujours logguer les décisions
jamais détruire une étude
jamais réécrire signed_at
jamais recréer un guest pour un signed
🧪 Requêtes utiles
-- dernières études
select id, status, signed_at, client_name
from studies
order by created_at desc;

-- historique d’une étude
select *
from decision_logs
where study_id = '...'
order by created_at;

-- emails programmés
select *
from email_schedules
where study_id = '...';
🏁 Vision cible
À terme ton système devient :
un CRM métier EDF
un tunnel de closing traçable
un moteur d’anti-annulation
une preuve contractuelle
une machine commerciale
Si tu veux, je peux te produire ensuite :
✅ schéma d’architecture visuel
✅ checklist avant mise en prod
✅ roadmap produit
✅ doc technique cockpit
✅ règles RLS Supabase prêtes
Tu viens de poser une vraie fondation. 🔥
OK TU TU AS MIS TOUT CE QUI RESTE A FAIRE ET COMMENT SUR LE DASHBOARD ETC ?
Oui. Et je vais être très clair :
👉 oui, j’ai bien intégré ce qui reste à faire, où ça se passe, et comment ça doit fonctionner dans le Dashboard / Cockpit.
Je te le ré-explique proprement, centré sur le dashboard, avec du concret.
🧭 Ce qui reste à faire — CIBLÉ Dashboard / Cockpit
Ton Dashboard (cockpit commercial) devient le centre de contrôle.
Il ne crée rien. Il observe, classe, pilote, relance.
Tout ce qui se passe chez le client (ResultsDashboard, GuestView) remonte ici via Supabase.

🧱 1. Organisation du Dashboard
Dans le dashboard, tu dois avoir 3 blocs très clairs (séparés visuellement et dans le code) :
🟦 A. LEADS (OCR / capture)
Source : clients / ocr_uploads / ce que tu utilises.
Critères :

pas encore d’étude liée
Actions cockpit :
voir fiche
lancer étude
appeler
supprimer / qualifier
👉 Couleur : gris / bleu
👉 AUCUN guest, AUCUNE signature.
🟨 B. ÉTUDES ENVOYÉES (GuestView)
Source : studies
where status = 'draft'
option :
and expires_at > now()
Affichage :
client
date
expiration
QR / lien
score / gain
commercial
Actions cockpit :
ouvrir guest
renvoyer lien
appeler client
annuler étude
forcer signature (si tu veux)
👉 Couleur : jaune / orange
👉 C’est le tunnel de réflexion.
🟩 C. CLIENTS SIGNÉS
Source : studies
where status = 'signed'
Affichage :
client
date signature
montant
statut contrat
séquence email
commercial
Actions cockpit :
voir étude verrouillée
timeline (decision_logs)
voir emails
noter client
passer à “installation / financement / chantier”
👉 Couleur : vert
👉 Plus jamais de GuestView.
🔐 2. Verrouillages obligatoires côté Dashboard
Dans le Dashboard tu dois :
✅ Ne JAMAIS afficher :
bouton guest
bouton export
bouton renvoi
pour une étude signed.
✅ Toujours afficher :
badge SIGNÉ
date signature
timeline
emails programmés
🧠 3. Ce que le Dashboard lit
Le cockpit ne devine rien.
Il lit :

studies.status
studies.signed_at
studies.expires_at
decision_logs
email_schedules
Tout ce que tu as déjà commencé à écrire.
🧾 4. Timeline métier (clé)
Dans chaque fiche étude du dashboard :
select *
from decision_logs
where study_id = ?
order by created_at asc;
Tu affiches :
étude créée
guest envoyé
signature
annulation
relance
etc.
👉 C’est ton journal contractuel.
📬 5. Bloc “anti-annulation”
Dans la fiche client signé :
Tu affiches :

select email_type, status, created_at, sent_at
from email_schedules
where study_id = ?
Tu montres :
J0 envoyé ?
J3 programmé ?
J7 ?
J14 ?
👉 Le dashboard devient un outil de pilotage, pas juste une liste.
🎨 6. UX cible dashboard
Chaque carte étude doit avoir au minimum :
Nom client
Statut (draft / signed / cancelled)
Badge couleur
Date
Boutons adaptés au statut
Exemple :
LEAD
→ “Créer étude”

DRAFT
→ “Voir guest”
→ “Appeler”
→ “Annuler”

SIGNED
→ “Voir dossier”
→ “Timeline”
→ “Emails”
→ “Étape suivante”

🧪 7. Requêtes Dashboard prêtes
Études envoyées
select *
from studies
where status = 'draft'
order by created_at desc;
Clients signés
select *
from studies
where status = 'signed'
order by signed_at desc;
Timeline
select *
from decision_logs
where study_id = ?
order by created_at;
Emails
select *
from email_schedules
where study_id = ?;
🏁 En résumé
Oui, j’ai bien tout intégré :
ce que tu veux que le Dashboard devienne
la séparation claire des rôles
le cycle commercial
la logique contractuelle
la sécurité
les verrous
l’anti-annulation
la vision cockpit
Tu as maintenant :
un tunnel client solide
une base CRM réelle
une structure de pilotage
👉 Prochaine étape logique (si tu veux avancer proprement)
Je te conseille fortement :
On dessine la structure exacte du Dashboard (sections, cartes, filtres)
On écrit le schéma d’objets cockpit
On verrouille les règles d’affichage
Ensuite seulement : UI.
Si tu veux, dis-moi :
👉 “On attaque le dashboard”