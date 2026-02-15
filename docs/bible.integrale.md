📕 AUTOPILOTE SOLAIRE
BIBLE SYSTÈME ULTRA DÉTAILLÉE
DOCUMENT MAÎTRE — NIVEAU AUDIT / CTO / REPRISE / INVEST

🧬 CHAPITRE 0 — PHASE DE PROFILAGE (SPEECH VIEW)
C’est la porte d’entrée du système.
Avant toute simulation, le système qualifie le profil psychologique du client pour calibrer le Coach.

0.1 — Rôle Stratégique
Déterminer si le client est :
- **Senior 🛡️** (Besoin de sécurité absolue, peur de l'erreur)
  - *Signaux* : Peur de se tromper, besoin de réassurance, décision lente.
  - *Adaptation Coach* : Vocabulaire "Garanti/Protégé", focus Institutionnel (EDF/État), rythme lent.
- **Banquier 📊** (Besoin de rentabilité, peur de perdre de l'argent)
  - *Signaux* : Besoin de comprendre, rationnel, décisions basées sur les chiffres/incohérences.
  - *Adaptation Coach* : Vocabulaire "Calculé/Vérifié", focus ROI, Tableaux, Hypothèses affichées.
- **Standard ⚡** (Besoin de simplicité, peur de la complexité)
  - *Signaux* : Pragmatique, orienté gain immédiat, impatience, "combien ça coûte ?".
  - *Adaptation Coach* : Vocabulaire "Concret/Rapide", focus Économies Mensuelles, Gain immédiat.
- **Hybride ⚖️** (Indécis, signaux mixtes)
  - *Correction* : Le système applique une priorité Senior (Sécurité) par défaut pour rassurer, tout en gardant les autres axes accessibles.

0.2 — Mécanique (SpeechView.tsx)
- **4 questions neutres** : Orientées psychologie (Peur vs Gain), jamais "vente".
- **Question Bonus** : Déclenchée automatiquement si l'écart de score est ≤ 1.
- **Output** : Un objet `ProfileDetectionResult` qui drive tout le reste.

0.3 — Signaux Psychologiques (PsychoSignals)
Le système ne renvoie pas juste un label, mais des métadonnées activables par l'UI :
- `peurDeSeTromper` (Senior ≥ 6) : Déclenche le verrouillage sur le module "Garanties" et "Sécurité EDF".
- `besoinDeChiffres` (Banquier ≥ 6) : Déclenche l'affichage prioritaire des tableaux ROI.
- `urgencePercue` (Standard ≥ 6) : Déclenche les comparateurs "Avant/Après" immédiats.
- `indecision` (Ecart ≤ 2) : Signale au Coach d'augmenter les silences et de valider chaque étape.

0.4 — Adaptation Silencieuse
Le Coach modifie dynamiquement LE FOND ET LA FORME sans changer la réalité mathématique :
- **Ordre des modules** : Sécurité avant ROI pour Senior, inverse pour Banquier.
- **Titres & Wording** : "Votre sécurité" vs "Vos chiffres".
- **Phrases de transition** : Adaptées au canal de communication du client.
- **Tables de Discours** : Voir *Annexe A* en fin de document pour le contenu exact des infobulles.

0.5 — L'Agent Décisionnel (Agent Zero)
En plus du code statique, une couche d'intelligence **distante** (Agent Zero Cloud) intercepte le `ProfileDetectionResult` pour affiner l'expérience en temps réel :
1.  **Réception** : Profil, Modes, Signaux, État d'avancement.
2.  **Décision** :
    *   *Module Order* : Quel module afficher en premier ? (ex: Garanties avant Prix pour Senior).
    *   *Tempo* : Vitesse des transitions CSS (Lent pour Senior, Rapide pour Standard).
    *   *Scarcity* : Affichage ou masquage des éléments d'urgence ("Offre limitée").
3.  **Exécution** : Injection CSS dynamique dans le Dashboard. L'agent ne modifie jamais le texte, uniquement la structure et le rythme.

> **Sécurité** : Les appels vers Agent Zero sont protégés par la clé API (Header `X-API-KEY`). La clé par défaut est `Titanium2025!`.
> **Configuration** : Un panneau caché permet de changer l'URL de l'API et la **Clé API** (5 clics sur le logo Soleil). La configuration est persistée en local.


0.6 — Certification Opérateur (Le Juge) ⚖️
Pour garantir que l'intelligence n'est pas contournée par l'humain, un système de "Certification" tourne en arrière-plan :
1.  **Suivi** : Le système compare en temps réel le module consulté avec l'ordre recommandé par Agent Zero.
    *   *Si conforme* : Le score de conformité reste à 100%.
    *   *Si violation* (ex: saut d'étape) : Le score perd 15 points.
2.  **Feedback** : Un badge "Certifié" (Vert/Orange/Rouge) s'affiche dans le header pour responsabiliser l'opérateur.
3.  **Audit** : À la fin de la session, le score final et les violations sont envoyés à l'API `/audit`.

4.  **Bloc Légal (Audit Shield)** : Un composant en bas de page affiche l'`ID AUDIT` et confirme la gouvernance des données.

Cette étape est **obligatoire**, certifiée par un ID de traçabilité, et conditionne l'UX du `ResultsDashboard`.
🧱 CHAPITRE 1 — SOCLE PHYSIQUE DU SYSTÈME (SUPABASE / POSTGRES)
Ce chapitre décrit exactement ce qui existe, ce que chaque objet contient, à quoi il sert, et comment tout s’assemble.
🗄️ 1.1 — SCHÉMAS SUPABASE UTILISÉS
Schémas actifs :
Schéma	Rôle
public	Données métier, logique principale
cron	Orchestration temporelle (pg_cron)
net	Appels HTTP internes (Edge triggers)
auth	Auth Supabase (si activé)
extensions	Extensions PostgreSQL (uuid, pg_cron, etc.)
👉 Règle d’architecture
Aucune table métier n’existe hors public.
🗂️ 1.2 — TABLES MÉTIER (PUBLIC)

### 🧍 public.clients
Rôle : source de vérité identité client.
| Colonne | Type | Rôle |
| :--- | :--- | :--- |
| `id` | uuid PK | Identifiant unique client |
| `civility` | text | M. / Mme |
| `email` | text UNIQUE | Clé métier |
| `phone` | text | Téléphone |
| `first_name` | text | Prénom |
| `last_name` | text | Nom |
| `city` | text | Ville |
| `email_optout` | boolean | Blocage marketing (Default: false) |
| `created_at` | timestamptz | Création |
| `updated_at` | timestamptz | Dernière modif |

**Invariants**
*   1 email = 1 client
*   jamais de delete sans purge associée
*   jamais d’email modifié sans log si système audit

### 📁 public.studies
Rôle : unité centrale business. Chaque étude = un dossier vivant.
**Colonnes VÉRIFIÉES**
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid PK | ID étude |
| `client_id` | uuid FK | Lien clients.id (Source nom/email) |
| `status` | study_status | `draft` / `sent` / `signed` / `cancelled` |
| `study_data` | jsonb | Données techniques (prod, conso, prix...) |
| `created_at` | timestamptz | Création |
| `expires_at` | timestamptz | Expiration commerciale |
| `signed_at` | timestamptz | Date signature effective |
| `cancellation_deadline` | timestamptz | J+14 après signature |
| `deposit_amount` | numeric | Montant acompte attendu |
| `deposit_paid` | boolean | Acompte versé ? |
| `deposit_paid_at` | timestamptz | Date encaissement acompte |
| `has_deposit` | boolean | Study nécessite acompte ? |
| `payment_mode` | text | virement / chèque |
| `payment_type` | text | comptant / crédit |
| `financing_mode` | text | cash / crédit / with_deposit |
| `contract_secured` | boolean | Verrou financier manuel |
| `rib_sent` | boolean | RIB transmis au client |
| `rib_sent_at` | timestamptz | Date envoi RIB |
| `reminder_sent` | boolean | Relance effectuée |
| `is_active` | boolean | Dossier actif |
| `opened_at` | timestamptz | 1ère ouverture GuestView |
| `opened_count` | integer | Nombre total d'ouvertures |
| `last_opened_at` | timestamptz | Dernière activité vue |
| `guest_view_url` | text | URL unique client |
| `client_email` | text | Snapshot/Cache |
| `client_phone` | text | Snapshot/Cache |
| `anti_annulation_initialized`| boolean | Sequence post-signature active |
| `total_price` | numeric | Prix total |
| `install_cost` | numeric | Coût installation |

**Invariants**
*   toute automation part de studies
*   aucun dossier critique sans study
*   jamais de `signed` sans `signed_at`

**🔥 LOGIQUE CRITIQUE : DÉTECTION D'ACOMPTE (`has_deposit`)**

> **RÈGLE MÉTIER VALIDÉE** (Février 2026)
> 
> Le champ `has_deposit` détermine si un acompte de 1500€ est REQUIS pour une étude.
> Cette valeur est **CALCULÉE** par le Brain et ne doit **JAMAIS** être écrasée par la base de données.

**Règles de calcul** :
```typescript
has_deposit = 
  financing_mode === "cash_payment" ||      // Paiement cash → acompte requis
  financing_mode === "partial_financing"    // Financement avec apport → acompte requis

// financing_mode === "full_financing" → has_deposit = false (pas d'acompte)
```

**Calcul de `financing_mode`** :
```typescript
if (cash_apport >= total_price && total_price > 0) {
  financing_mode = "cash_payment"
} else if (cash_apport > 0 && cash_apport < total_price) {
  financing_mode = "partial_financing"
} else {
  financing_mode = "full_financing"
}
```

**Exemples** :
| Cas | `cash_apport` | `total_price` | `financing_mode` | `has_deposit` |
|-----|---------------|---------------|------------------|---------------|
| Financement 100% | 0€ | 25000€ | `full_financing` | `false` |
| Financement avec apport | 10000€ | 25000€ | `partial_financing` | `true` |
| Paiement cash | 25000€ | 25000€ | `cash_payment` | `true` |

**Montant d'acompte** :
- Si `has_deposit = true` → `deposit_amount = 1500€`
- Si `has_deposit = false` → `deposit_amount = null`

**Statut d'acompte (War Room)** :
- `deposit_paid = true` → Affiche **"PAYÉ ✅"**
- `has_deposit = true` ET `deposit_paid = false` → Affiche **"EN ATTENTE ⚠️"**
- `has_deposit = false` → Affiche **"NON REQUIS ➖"**

**⚠️ ATTENTION** : Ne jamais utiliser la valeur de `has_deposit` depuis Supabase pour déterminer si un acompte est requis. Toujours recalculer basé sur `financing_mode`.

**Localisation du code** : `src/brain/signals/mappers.ts` (fonction `mapStudyToDisplay`)


### � public.signed_contracts (Table Spécifique War Room)
Rôle : Extension contractuelle.
| Colonne | Type |
| :--- | :--- |
| `id` | uuid PK |
| `study_id` | uuid FK |
| `client_id` | uuid FK |
| `signed_at` | timestamptz |
| `cancellation_deadline` | timestamptz |
| `status` | text |
| `metadata` | jsonb |
| `created_at` | timestamptz |

### 📬 public.email_queue
Rôle : moteur d’orchestration. AUCUN email n’est envoyé sans passer ici.
*(Voir structure détaillée plus bas)*

### 🧭 public.tracking_events
*(Voir structure détaillée plus bas)*

### 🧠 public.decision_logs
*(Voir structure détaillée plus bas)*

### 📜 public.email_logs
*(Voir structure détaillée plus bas)*

---

## 👁️ 1.3 — VUES CRITIQUES (Liaison SQL -> Brain)
Les vues sont le cerveau SQL passif qui alimente le Dashboard.

### 📊 `studies_activity_summary_v2` (ACTIVE)
**Rôle** : Vue principale pour l'hydratation du Brain.
Agrège : `studies` + `clients` + stats `tracking_events`.
Source de vérité des KPIs et des tris.

### 📊 `studies_activity_summary` (LEGACY)
Vue historique, agrégation simple des events (opens/clicks).

### 🏥 `email_queue_health`
Monitoring technique du pipeline.
Compte les emails `blocked`, `pending`, `failed` et calcule les taux d'erreur.

### 🚨 `alerts_to_call`
Filtre les dossiers chauds nécessitant une action humaine immédiate (War Room).
Rôle :
lecture comportementale
input Brain
base de surveillance
🚨 alerts_to_call
Vue de détection automatique d’anomalies.
Elle encode déjà une logique décisionnelle primitive.
Exemples de règles :
sent + clic + silence > 48h
sent + ≥3 ouvertures + activité récente
signed + 3–7 jours + 0 ouverture
signed + ≥4 ouvertures
Produit :
study_id
opens
clicks
last_activity
alert_type
C’est une préfiguration de War Room automatisée.
👀 studies_to_watch
Vue de surveillance passive.
Condition :
sent + ≥3 opens + silence 48h
signed + 0 open
Aucune action automatique.
Pure conscience système.
🧬 studies_with_behavior
Vue enrichie :
jours depuis signature
jours avant fin délai
total clicks
pattern comportemental (muted/agitated/interested/stable)
is_war_room
👉 Cette vue est déjà un proto-Brain SQL.
⚙️ CHAPITRE 2 — PIPELINE EMAIL RÉEL (NIVEAU INDUSTRIEL)
2.1 — Séquence complète
[EVENT METIER]
      ↓
INSERT public.email_queue(status='pending')
      ↓
pg_cron (job 7)
      ↓
SELECT ... FOR UPDATE SKIP LOCKED
      ↓
status → processing
      ↓
Edge Function send_email_from_queue
      ↓
Resend API
      ↓
SUCCESS → status=sent, sent_at
      ↓
FAIL → retry_email()
2.2 — Règles d’orchestration
1 exécution = 1 email
lock transactionnel
pas de batch
pas de double envoi possible
2.3 — Fonction retry_email (SQL officielle)
CREATE OR REPLACE FUNCTION retry_email(p_email_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE email_queue
  SET
    attempts = attempts + 1,
    status = CASE
      WHEN attempts + 1 >= 3 THEN 'failed'
      ELSE 'pending'
    END,
    scheduled_for = CASE
      WHEN attempts + 1 = 1 THEN now() + interval '5 minutes'
      WHEN attempts + 1 = 2 THEN now() + interval '30 minutes'
      WHEN attempts + 1 = 3 THEN now() + interval '2 hours'
      ELSE scheduled_for
    END,
    last_error = COALESCE(last_error, 'retry scheduled')
  WHERE id = p_email_id;
END;
$$;
2.4 — Sécurité anti-blocage
Problème ciblé : email figé en processing.
UPDATE email_queue
SET status='error',
    last_error='auto-reset stuck processing'
WHERE status='processing'
AND created_at < now() - interval '15 minutes';
À placer en cron.
⏰ CHAPITRE 3 — CRON JOBS
Job principal
Fréquence : toutes les X minutes ou 9h
Action : process queue
Source : cron.job
SELECT command FROM cron.job WHERE jobid = 7;
Jobs secondaires recommandés
nettoyage processing
surveillance erreurs
purge anciens logs
purge orphelins
🧠 CHAPITRE 4 — BRAIN : OBJETS LOGIQUES (CE QUE L’APP DOIT RECONSTRUIRE)
Chaque dossier est reconstruit sous forme :
StudyBrainObject {
  study_id
  client
  status
  financial_state
  behavior_state
  timeline_state
  danger_score
  war_room_flag
  next_action
}
4.1 — Comportement
Entrées :
tracking_events
studies_activity_summary
studies_with_behavior
Sorties :
muted
agitated
interested
hyper_read
silent
stable
4.2 — Danger Score (exemple structure)
Variables possibles :
days_since_signed
deposit_paid
opens
clicks
silence_duration
cancellation_deadline
Score composite :
pondération temps
pondération comportement
pondération argent
Produit :
priorité War Room
ordre d’affichage
tension système
⚔️ CHAPITRE 5 — WAR ROOM v2 (OPATIONAL POWER)
La War Room n’est plus une liste, c’est un poste de commande tactique.
5.1 — Structure Logique (La Cascade d'Action)
1. **Bataille (RiskMapVisx)** : Localisation spatiale du risque (Silence vs Montant).
2. **Cinétique (BehaviorDriftTimeline)** : Compréhension de l'irréversibilité temporelle.
3. **Friction (PipelineMomentum)** : Identification des blocages de flux.
4. **Focus (DealFocusPanel)** : Unité d'action pure. 1 dossier = 1 recommandation = 1 CTA.

5.2 — Déclenchement & Sortie
- **Entrée** : `status = signed` + `deposit_paid = false` + `danger_score >= 60`.
- **Action Humaine** : Appel rassurance, closing, ou ralliement manager.
- **Sortie** : `deposit_paid = true` (Succès) ou `status = cancelled` (Échec).
- **Tracciabilité** : Chaque clic sur "Action Prioritaire" est loggé dans `decision_logs`.
🛠️ CHAPITRE 6 — PROCÉDURES OPÉRATIONNELLES
Sécuriser un acompte
UPDATE studies
SET deposit_paid=true,
    deposit_paid_at=now(),
    deposit_payment_mode='virement'
WHERE id='...';
Puis :
INSERT INTO decision_logs (...)
Annuler un dossier
UPDATE studies
SET status='cancelled'
WHERE id='...';
Puis :
arrêt séquences
log décision
Forcer automate
UPDATE email_queue
SET scheduled_for=now()-interval '1 minute'
WHERE status='pending';
🧨 CHAPITRE 7 — POINTS DE DÉFAILLANCE CRITIQUES
email_queue corrompue → plus d’automate
tracking_events muets → cerveau aveugle
cron stoppé → système mort
absence decision_logs → perte mémoire
studies.status incohérents → war room faussée
🔐 CHAPITRE 8 — INVARIANTS ABSOLUS
aucune logique métier en edge
aucune décision basée uniquement sur tracking
aucun email hors queue
aucun signed sans war room
aucune action humaine sans trace
📦 CHAPITRE 9 — CE QUE N’IMPORTE QUEL DEV DOIT POUVOIR FAIRE AVEC CE DOC
reconstruire la DB
comprendre chaque flux
identifier chaque zone critique
relancer le système
auditer une panne
reprendre le projet
CHAPITRE 10 — BRAIN ALGORITHMIQUE COMPLET
(Logique décisionnelle, états, scores, priorisation, contrats)
🧠 10.1 — DÉFINITION FORMELLE DU “BRAIN”
Le Brain n’est pas une feature.
C’est une couche de reconstruction logique.
Il n’enregistre rien.
Il lit, agrège, classe, priorise.
Il transforme des tables mortes en objets décisionnels vivants.
Objet canonique reconstruit par le Brain
BrainStudy {
  // Identité
  study_id
  client_id
  client_name
  client_email

  // États bruts
  study_status
  deposit_paid
  financing_mode
  signed_at
  expires_at
  cancellation_deadline

  // Temps
  days_since_creation
  days_since_sent
  days_since_signed
  days_before_deadline

  // Activité
  opens_total
  clicks_total
  views_total
  last_activity_at
  silence_duration_hours

  // États calculés
  behavior_state
  risk_state
  financial_state
  timeline_state

  // Scores
  danger_score (0–100)
  opportunity_score (0–100)
  engagement_score (0–100)

  // Flags
  is_war_room
  is_to_watch
  is_stable
  is_dead

  // Décision
  next_recommended_action
  urgency_level
}
🧬 10.2 — CONSTRUCTION DES INDICATEURS TEMPORELS
Tous les temps sont recalculés à la volée.
days_since_sent   = now() - studies.sent_at
days_since_signed = now() - studies.signed_at
silence_hours     = now() - last(tracking_events.created_at)
days_before_deadline = cancellation_deadline - now()
Ces valeurs sont structurelles.
Elles conditionnent tous les états.
🧪 10.3 — ÉTATS COMPORTEMENTAUX (BEHAVIOR_STATE)
Basé uniquement sur :
tracking_events
études_activity_summary
temporalité
États normalisés
État	Définition structurelle
muted	aucune activité depuis >72h
interested	≥1 clic OU ≥3 ouvertures
agitated	≥4 événements <24h
hyper_read	≥6 ouvertures <48h
ghost	jamais ouvert
stable	activité faible régulière
post_decision	plus d’activité après action humaine
Exemple de règles
IF opens=0 AND age>48h → ghost  
IF opens>=3 AND silence>48h → muted  
IF events_last_24h>=4 → agitated  
IF opens>=6 AND days<=3 → hyper_read  
IF opens>=1 AND clicks>=1 → interested  
ELSE → stable
⚠️ 10.4 — ÉTATS DE RISQUE (RISK_STATE)
Le risque n’est jamais marketing.
Il est juridico-financier.
Variables critiques
signé ou non
acompte payé
jours avant fin délai (calcul dynamique : `deadline - now()`)
comportement
États normalisés
État	Sens
safe	aucune exposition
monitor	passif, surveillance
exposed	signé sans acompte
critical	signé + délai proche
lost	délai dépassé
secured	acompte encaissé
💰 10.5 — ÉTATS FINANCIERS (FINANCIAL_STATE)
Construit uniquement depuis studies.
État	Condition
unqualified	draft
proposal	sent
signed_unsecured	signed + deposit_paid=false
signed_secured	signed + deposit_paid=true
cancelled	status=cancelled
expired	expires_at < now()
⏳ 10.6 — ÉTATS TEMPORELS (TIMELINE_STATE)
But : rendre le temps lisible.
État	Règle
fresh	<48h
warm	2–5 jours
hot	5–10 jours
critical_window	signé + J+3 → J+10
expired	dépassement
📊 10.7 — SCORES COMPOSITES
10.7.1 — Engagement Score (0–100)
Basé sur :
opens (x)
clicks (x2)
views (x1.5)
récence
Exemple structure :
engagement =
  opens*5 +
  clicks*15 +
  views*8 -
  silence_hours*0.3

cap 0..100
10.7.2 — Danger Score (0–100)
Cœur du système.
Variables :
signé sans acompte (+30)
jours depuis signature (+3/jour)
jours avant deadline (-4/jour)
silence prolongé (+10)
agitation post-signature (+15)
Exemple logique :
danger = 0

if signed and not deposit_paid: danger += 30
danger += days_since_signed * 3
danger += silence_days * 5
// Note: Le calcul 'days_since_signed' est dynamique (getDaysSince) pour éviter les valeurs statiques (ex: block 14 jours)
danger += agitation_factor
danger -= days_before_deadline * 4

clamp 0..100
Seuils :
<30 : stable
30–60 : watch
60–80 : war room
80 : critique absolue
10.7.3 — Opportunity Score
Utilisé surtout côté leads non signés.
Variables :
vitesse d’ouverture
clics
répétition
fraîcheur
But : prioriser les relances humaines intelligentes.
⚔️ 10.8 — WAR ROOM : DÉCLENCHEMENT LOGIQUE
Un dossier est structurellement War Room si :
status = signed
AND deposit_paid = false
AND days_since_signed >= 2
AND danger_score >= 60
OU
days_before_deadline <= 3
AND deposit_paid = false
Chaque entrée War Room est enrichie par :
comportement
derniers emails reçus
derniers events
score
urgence
recommandation
🧭 10.9 — NEXT ACTION ENGINE
Le Brain produit une action recommandée, jamais un ordre.
Exemples :
Contexte	Recommandation
signed + ghost	Appel rassurance
signed + agitated	Appel clarification
signed + hyper_read	Appel closing
sent + agitated	Appel opportunité
sent + muted	Séquence email douce
critical_window	Appel immédiat
deadline <48h	Appel prioritaire
Format standard :
next_action = {
  type: 'call' | 'email' | 'wait' | 'cancel',
  reason: string,
  urgency: 'low' | 'medium' | 'high' | 'absolute'
}
🛰️ 10.10 — CONTRAT BRAIN / UI
Le Brain ne sait rien de l’UI.
L’UI ne calcule rien.
Le Brain expose :
GET /brain/studies

→ [
   BrainStudy,
   BrainStudy,
   ...
]
Chaque territoire UI consomme un sous-ensemble.
🗺️ CHAPITRE 11 — PRODUIT & TERRITOIRES
On décrit maintenant l’APPLICATION COMME SYSTÈME OPÉRATIONNEL.
🌐 11.1 — TERRITOIRES OFFICIELS
Le produit est volontairement territorial pour empêcher la confusion.
Cockpit (vision instantanée)
War Room (combat)
Pilotage (stratégie)
Registres (mémoire)
Results Dashboard (outil vente)
Mode Zen / Priorité
Chaque territoire consomme le Brain, jamais la DB directement.

### 🎨 11.1.1 — ARCHITECTURE VISUELLE CANONIQUE (VISX V2)
Le frontend suit désormais une architecture stricte "Truthful Chart".
Pour les règles d'implémentation (Wrapper, Moteur Graphique, Tooltip), se référer impérativement à :
👉 **[docs/ui.visx_architecture.md](./ui.visx_architecture.md)**
Toute contribution UI doit respecter ce standard.
🎛️ 11.2 — COCKPIT
Rôle :
➡️ Savoir en 3 secondes si l’entreprise est en danger.
Entrées Brain
% dossiers exposés
danger moyen
nb war room
évolution 7 jours
Indicateurs
Bannière globale (vert/bleu/orange/rouge)
KPI financiers
Tension système
Dossiers chauds
Cockpit = radar, pas bureau.
⚔️ 11.3 — WAR ROOM
Territoire opérationnel pur.
N’affiche que :
BrainStudy where is_war_room = true
order by danger_score desc
Chaque carte montre :
identité
temps
comportement
résumé événements
recommandation Brain
actions possibles
Actions possibles :
marquer acompte payé
annuler
planifier rappel
justifier décision
Chaque action → decision_logs.
📈 11.4 — PILOTAGE (CONFIANCE & STRATÉGIE)
Rôle : Diriger l’entreprise par la donnée, sans l'émotion du dossier individuel.
Expose :
- **S01. Verdict** : CA à risque vs CA sécurisé.
- **S02. Drift** : Analyse du décrochage client (Pression Email Visualisée sur 14 jours glissants).
- **S03. Pipeline** : Flux de conversion brut.
- **S04. Projection** : Atterrissage budgétaire 90 jours.
Données : Agrégées (Metrics & FinancialStats).
Interface : "Executive Finish" (Austère, Dense, Autoritaire).
🗄️ 11.5 — REGISTRES
Bibliothèque.
clients
studies
email_queue
email_logs
tracking
decision_logs
Permet :
audit
recherche
preuve
historique
📊 11.6 — RESULTS DASHBOARD (OUTIL COMMERCIAL)
C’est un sous-système autonome.
Il produit :
étude chiffrée
PDF
lien invité
base study_data
Il ne contient aucune logique business centrale.
Il alimente studies + email_queue.
Tu as déjà sa bible technique complète.
🧘 11.7 — MODE ZEN / PRIORITÉ
Filtres cognitifs.
Ils ne changent rien au Brain.
Ils changent la projection mentale de l’opérateur.
Zen : masque chiffres, tension, courbes
Priorité : masque tout sauf war room critique
🧱 CHAPITRE 12 — INVARIANTS PRODUIT
l’utilisateur ne pilote jamais des tables
il pilote des états
il n’envoie jamais d’email
il sécurise des situations
toute action est historisée
Autopilote n’est pas un CRM.
C’est un système de maintien de cohérence business.
🧠 CHAPITRE 13 — DIFFÉRENCIATION STRATÉGIQUE
Ce système est fondamentalement différent :
d’un CRM (qui stocke)
d’un outil marketing (qui pousse)
d’un ATS (qui suit)
Il :
mesure la dérive
détecte les zones de rupture
concentre l’humain
protège la valeur
Il est plus proche d’un cockpit d’avion que d’un logiciel
CHAPITRE 14 — SYSTÈME EMAIL COMPLET
(moteur, séquences, règles, payloads, matrices, sécurité)
🔁 14.1 — RÔLE STRUCTUREL DE L’EMAIL
L’email n’est pas un canal marketing.
C’est un organe du système.
Il sert uniquement à :
maintenir un lien informationnel
soutenir la décision
réduire le risque d’annulation
créer des points de contact humains
Il ne décide jamais.
Il accompagne ce que le Brain surveille.
🧱 14.2 — INVARIANTS EMAIL (NON NÉGOCIABLES)
Aucun email n’est envoyé hors email_queue
Aucun email n’est déclenché depuis l’Edge
Aucun email n’est déclenché par le tracking
Toute tentative est historisée
Le système est idempotent
Un email = un enregistrement
Un type = une intention
Un échec = un événement métier
🗄️ 14.3 — STRUCTURE CANONIQUE email_queue
email_queue (
  id uuid pk,
  study_id uuid fk,
  client_id uuid fk,
  email_type text,
  status text,                 -- pending | processing | sent | error | failed | cancelled
  scheduled_for timestamptz,
  payload jsonb NOT NULL,
  attempts int default 0,
  last_error text,
  resend_id text,
  created_at timestamptz,
  sent_at timestamptz
)
⚙️ 14.4 — PIPELINE DE PRODUCTION RÉEL
Événement métier
→ INSERT email_queue (pending)
→ pg_cron (toutes les 30 min)
→ SELECT … FOR UPDATE SKIP LOCKED
→ status = processing
→ Edge send_email_from_queue
→ génération HTML depuis email_templates
→ envoi Resend
→ update sent / retry / failed
→ email_logs
🔒 14.5 — VERROUILLAGE & IDÉMPOTENCE
SELECT *
FROM email_queue
WHERE status='pending'
AND scheduled_for <= now()
ORDER BY scheduled_for
LIMIT 1
FOR UPDATE SKIP LOCKED;
Empêche :
double envoi
exécutions parallèles
relances fantômes
🔁 14.6 — RETRY INTELLIGENT
Fonction officielle :
retry_email(email_id uuid)
Règles :
| Tentative | Délai | État |
-----------|--------
1 | +5 min | pending
2 | +30 min | pending
3 | +2h | pending
4 | failed | humain
Le système ne boucle jamais.
🧹 14.7 — ANTI-BLOCAGE processing
Un email ne peut rester en processing > 15 min.
Tâche de nettoyage :
UPDATE email_queue
SET status='error'
WHERE status='processing'
AND created_at < now() - interval '15 min'
🧬 14.8 — MATRICE DES TYPES D’EMAIL
Chaque email_type est :
unique
traçable
versionnable
lié à une intention
🟥 A. POST-SIGNATURE — ANTI-ANNULATION
Objectif : sécuriser l’acompte + solidifier la décision.
Séquence type :
| Jour | email_type | Intention |
-----|------------
J+0 | anti_j0_confirmation | réassurance
J+1 | anti_j1_legitimacy | crédibilité
J+2 | anti_j2_expertise | valeur
J+3 | anti_j3_security | protection
J+5 | anti_j5_deposit_reminder | action douce
J+8 | anti_j8_projection | futur
Chaque email inclut :
{
  "client_name": "...",
  "study_id": "...",
  "secure_link": "...",
  "commercial_name": "...",
  "phone": "...",
  "project_summary": {...}
}
🟧 B. POST-REFUS — RÉOUVERTURE
Objectif : clarifier sans pression.
Jour	email_type
J+1	post_refus_1_understanding
J+3	post_refus_2_new_angle
J+6	post_refus_3_case_study
J+10	post_refus_4_last_open
🟨 C. LEADS — PRÉ-QUALIFICATION
Objectif : faire émerger les projets sérieux.
Étape	email_type
lead_1_welcome	
lead_2_value	
lead_3_projection	
lead_4_soft_call	
📦 14.9 — PAYLOAD STANDARDISÉ
Chaque email reçoit un payload autonome.
{
  "client": {
    "name": "",
    "email": "",
    "phone": ""
  },
  "study": {
    "id": "",
    "expires_at": "",
    "guest_url": ""
  },
  "commercial": {
    "name": "",
    "email": ""
  },
  "context": {
    "sequence": "anti_annulation",
    "step": 2
  }
}
➡️ L’Edge ne lit que ça.
➡️ Aucun SELECT métier dans l’Edge.
🧪 14.10 — LIEN AVEC tracking_events
tracking_events ne déclenche rien.
Il enrichit uniquement :
Brain
vues
War Room
Jamais de :
IF open → envoi
IF click → relance
🧱 14.11 — email_templates
Chaque template contient :
template_key (unique)
subject
body_html
body_text
Versionnable via email_templates_changes_log.
Le moteur ne connaît que le template_key.
📊 14.12 — LOGS
Deux niveaux :
email_queue → orchestration
email_logs → transport
Jamais confondus.
🧠 14.13 — CE QUE L’EMAIL NE DOIT JAMAIS FAIRE
relancer une séquence
changer un statut
décider
qualifier
annuler
L’email est un muscle, pas un cerveau.
📙 AUTOPILOTE SOLAIRE
CHAPITRE 15 — EXPLOITATION INDUSTRIELLE
(runbook, continuité, reprise, incident, scaling)
🧭 15.1 — RÔLES OPÉRATIONNELS
Rôle	Mission
Opérateur	traite War Room
Superviseur	surveille Cockpit
Admin	gère Registres
Tech	maintient pipeline
Direction	pilote Pilotage
⏱️ 15.2 — ROUTINE QUOTIDIENNE OFFICIELLE
Lecture bannière
War Room vide → objectif 0
Vérification email_queue
Vérification échecs
Pilotage tension
Durée cible : 20–30 min.
⚔️ 15.3 — PROCÉDURE WAR ROOM
Pour chaque dossier :
lire comportement
appeler
noter
décider
consigner
Toute action → decision_logs.
🚨 15.4 — PROCÉDURES INCIDENT
Emails bloqués
SELECT * FROM email_queue WHERE status='processing';
→ reset
→ vérifier cron
→ vérifier Edge
Trop d’erreurs
suspendre cron
analyser payload
vérifier Resend
vérifier quotas
War Room vide anormalement
vérifier vues
vérifier tracking
vérifier jobs
🔐 15.5 — CONTINUITÉ & REPRISE
Un tiers peut reprendre en 3 blocs :
Supabase export
Edge Functions repo
Variables environnement
🧹 15.6 — MAINTENANCE
Hebdomadaire :
erreurs
stuck
logs
Mensuel :
backup
index
coûts
purge
📈 15.7 — SCALING
Les limites naturelles :
email_queue
tracking_events
Brain queries
Le système scale :
verticalement (Postgres)
horizontalement (Edge)
cognitivement (territoires)
🧠 AUTOPILOTE SOLAIRE
CHAPITRE 16 — BIBLE BUSINESS & INVEST
(valeur, moat, produit, transmissibilité)
🎯 16.1 — PROBLÈME RÉEL RÉSOLU
Pas “envoyer des emails”.
Mais :
fuite post-signature
annulation
perte silencieuse
mauvais focus humain
décisions non tracées
💎 16.2 — VALEUR SYSTÈME
Autopilote :
concentre l’humain
détecte l’invisible
protège le cash
réduit l’attrition
crée un cockpit de vente
🧠 16.3 — MOAT
Architecture décisionnelle
Culture de la non-automatisation aveugle
Territorialisation cognitive
Pipeline idempotent
Brain indépendant de l’UI
🏗️ 16.4 — REPRENABILITÉ
Un repreneur reçoit :
moteur logique
pipeline
procédures
états
documentation
Ce n’est pas un projet.
C’est un système opérable.
🧬 16.5 — ÉVOLUTIONS POSSIBLES
IA comportementale
prédiction d’annulation
scoring ML
détection d’anomalies
multi-verticalisation
🏁 16.6 — CE QUI FAIT LA VALEUR
Pas le code.
Pas l’UI.
👉 La cohérence systémique.
🧾 CONCLUSION GLOBALE
Autopilote est :
un moteur de réduction d’entropie business
un cockpit de décision
une prothèse cognitive de direction
un système anti-perte

---

# 🕹️ CHAPITRE 17 — COCKPIT v2 (PILOTAGE)
(Architecture "Executive Finish", Design System 30k€)

## 🏗️ 17.1 — ARCHITECTURE TERRITORIALE
Le territoire Pilotage est localisé dans `/src/components/territories/Pilotage/`.
- **`/core`** : Moteurs Visx Decision-Ready (`FinancialRiskProof`, `ClientDriftVisx`, `RiskMapVisx`).
- **`/screens`** : Vues d'autorité (Verdict, Drift, Pipeline, Projection).
- **`/ui`** : Composants de structure premium.

## 👁️ 17.2 — PHILOSOPHIE "EXECUTIVE FINISH"
L'interface rejette le "marketing" pour adopter la "rigueur technique" :
1. **Authority First** : S01 impose le verdict financier en 2 secondes.
2. **Analysis Proof** : S02-S04 prouvent le verdict via des données comportementales et de flux.
3. **No Decoration** : Tout élément graphique doit répondre à une question métier. Si c'est juste "joli", c'est supprimé.

## 📊 17.3 — LES ÉTAGES DU PILOTAGE RÉFORMÉ
- **S01. Financial Status** : Verdict brut du CA à risque. Barème critique à 20%.
- **S02. Drift Analysis (Post-Signature)** : 
    - **Loi du décrochage** : Visualisation de l'irréversibilité comportementale. Focus J+7 (48% silence) et J+14 (72% annulation).
    - **Moteur de Preuve** : Journal chronologique des actions autonomes (Relances, Alertes, Escalades) pour démontrer l'activité du système.
- **S03. Pipeline Momentum** : Analyse de la friction par étape (Lead, RDV, Signature, Acompte).
- **S04. Revenue Projection** : Focus sur le GAP budgétaire et l'atterrissage à 90 jours.
- **S0H. Leads & ROI** : 
    - **Création vs Protection** : Flux de leads entrants vs Moteur anti-annulation.
    - **Preuve ROI** : Chiffre héroïque du **CA sauvé par l'IA (107k€)** et temps commercial économisé.

# 💎 CHAPITRE 18 — DESIGN SYSTEM D'AUTORITÉ (30k€)
...
Le système visuel code la valeur et le sérieux du produit.

## 🎨 18.1 — PALETTE INSTITUTIONNELLE
- **Background Global** : `#0A0E27` (Sombre, Profond).
- **Surfaces** : `#0F1629` (Bords nets, pas d'ombres portées).
- **Accents (Sourds)** :
  - `Action/Info` : `#38BDF8` (Cyan technique).
  - `Succès` : `#4ADE80` (Vert monétaire).
  - `Alerte` : `#FB923C` (Orange tension).
  - `Critique` : `#F87171` (Rouge danger).
- **Typographie** :
  - **Manrope (Extrabold)** : Chiffres héroïques, Titres d'autorité.
  - **IBM Plex Mono** : Données techniques, Valeurs, Dates.
  - **Inter (Medium)** : Corps de texte, Analyse, Descriptions.

## 📐 18.2 — GRILLE DE RIGUEUR (8px)
Toute l'interface est calée sur un modulo de **8px** :
- **Paddings** : `p-10 (40px)` ou `p-12 (48px)`.
- **Gaps** : `gap-8 (32px)` ou `gap-16 (64px)`.
- **Radii** : `rounded-2xl (16px)` ou `3xl (24px)`.

## 📉 18.3 — DOCTRINE VISX
- **Lines** : 1.5px (Ultra-fines).
- **Tooltips** : Toujours **latéraux et fixes**. Ne jamais masquer la donnée survolée.
- **Interaction** : Pas de zoom, pas de rebond. Le survol doit être une "lecture chirurgicale".

📚 ANNEXE A — TABLES DE DISCOURS DU COACH (INFO_MODULE)
Le contenu exact des infobulles par profil.

A.1 — MODULE SÉCURITÉ (Module 1)
| Profil | Cadre EDF | Zéro Faillite | Contrat | Aides |
| :--- | :--- | :--- | :--- | :--- |
| **Senior** | Un cadre public de confiance | Une continuité garantie | Un cadre juridique protecteur | Des aides encadrées par l’État |
| **Banquier** | Un acteur public structurant | Un risque structurel neutralisé | Un cadre contractuel normé | Un cadre public national |
| **Standard** | Ce que signifie « Groupe EDF » | Pourquoi c’est important | Ce que ça veut dire concrètement | Pourquoi elles sont fiables |

A.2 — MODULE PROCESS (Module 2)
| Profil | Engagement | Paiement | Prise En Charge |
| :--- | :--- | :--- | :--- |
| **Senior** | 🛡️ Engagement de protection | 🤍 Engagement sans pression | 🧭 Accompagnement complet |
| **Banquier** | ⚖️ Transfert de risque | 📄 Condition suspensive | 📁 Pilotage EDF |
| **Standard** | 🔒 Zéro risque de blocage | 💡 Paiement à la validation | 🙌 EDF s'occupe de tout |

A.3 — MODULE PILOTAGE (Module 3)
| Profil | Cadre Global | Complexité | Sécurisation |
| :--- | :--- | :--- | :--- |
| **Senior** | 🛡️ Délégation sécurisée | 📂 Complexité maîtrisée | 🤍 Continuité et protection |
| **Banquier** | 📋 Pilotage administratif | 📑 Processus encadré | 📊 Suivi long terme |
| **Standard** | 🙌 EDF s’occupe du parcours | 🧩 Plusieurs étapes | 🔁 Pas un one-shot |

A.4 — MODULE EXTENSION (Module 4)
| Profil | Global | Performance | Matériel |
| :--- | :--- | :--- | :--- |
| **Senior** | 🛡️ Protection dans le temps | ☀️ Production surveillée | 🧩 Matériel protégé |
| **Banquier** | 📑 Cadre de garantie | 📊 Garantie de performance | — |
| **Standard** | 🔒 Vous êtes couvert | ⚡ Production garantie | — |
---

## 🏰 CHAPITRE 15 — ARCHITECTURE SENTINEL (SÉCURITÉ INFRASTRUCTURELLE)

L'"Architecture Sentinel" est le bouclier physique et logique qui protège les données et la rentabilité du système. Elle a été déployée en Février 2026 suite à l'audit de sécurité complet.

### 🛡️ 15.1 — LE STOCKAGE : INTEGRITY LAYER
La colonne `danger_score` dans la table `studies` est désormais le réceptacle central des décisions du Brain.
- **Rôle** : Permet au Brain de "marquer" physiquement un dossier comme étant à risque dans la base de données.
- **Usage** : Utilisée par les vues SQL de pilotage pour isoler le CA à risque du CA sécurisé.

### 🧭 15.2 — LE PILOTAGE : ARCHITECTURE DÉCISIONNELLE
Le pilotage n'est plus une simple visualisation, c'est une aide à la décision stratégique.
- **Requêtes de Stats** : Implémentation de calculs temps réel comparant le CA brut vs CA à risque (Basé sur le `danger_score`).
- **War Room Integration** : Les dossiers dépassant un certain seuil de `danger_score` sont automatiquement aspirés dans la War Room pour action immédiate.

### 🔐 15.3 — LA SÉCURITÉ : TOKEN HARDENING
Protection contre l'exfiltration de données et l'accès non autorisé aux études clients.
- **UUID v4 Mandatory** : La colonne `guest_view_token` utilise désormais exclusivement des UUID v4 générés par le serveur (`uuid_generate_v4()`).
- **Enforcement d'Expiration** : La fonction SQL `get_study_by_token` vérifie systématiquement la date `expires_at`.
- **Backward Compatibility** : La logique accepte les anciens IDs pour ne pas briser les liens existants, tout en forçant le passage aux tokens pour tout nouveau dossier.

---
