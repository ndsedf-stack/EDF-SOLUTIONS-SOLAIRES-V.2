🧠 COACH SYSTEM — README.md

Architecture, règles, responsabilités et phases (VERSION TERRAIN / PROD)

🎯 OBJECTIF DU SYSTÈME

Ce projet implémente un système de coaching invisible côté client, destiné à guider le conseiller en temps réel pendant un rendez-vous, sans jamais perturber l’expérience client.

Le coach :

s’adapte au profil psychologique du client

guide le discours, le rythme et les modules

bloque les erreurs critiques

peut être désactivé instantanément

ne doit JAMAIS être visible côté client

🧱 PRINCIPES FONDAMENTAUX (À NE JAMAIS VIOLER)
❌ Le coach n’est PAS un composant UI classique

Il ne participe PAS à l’expérience client

Il ne doit JAMAIS apparaître sur l’écran client (HDMI, partage, etc.)

✅ Le coach est un instrument interne

HUD discret = guidance silencieuse

Panel = pilotage actif

OFF = extinction totale

🔒 Règle absolue

Si un doute existe → le coach doit disparaître

🧠 VUE D’ENSEMBLE — ARCHITECTURE ACTUELLE
ResultsDashboard
│
├── CoachJail ← Sécurité écran (conseiller uniquement)
│ │
│ └── CoachController ← ORCHESTRATEUR CENTRAL
│ │
│ ├── HUD (CoachCompassMinimal)
│ │
│ └── PANEL (CoachRouter)
│ ├── SeniorCoach
│ ├── BanquierCoach
│ └── CommercialCoach
│
├── AlertSystem ← Règles de sécurité & alertes
├── VocabularyGuard ← Surveillance vocabulaire
├── RDVStateMachine ← Avancement logique du RDV
└── UI Client (Dashboard)

🧠 QUI DIRIGE QUI (TRÈS IMPORTANT)
🧭 Autorité descendante

ResultsDashboard

possède tous les états globaux

décide SI le coach existe

décide QUEL profil est actif

décide HUD vs PANEL

CoachController

orchestre l’affichage

applique les règles OFF / ON

garantit “HUD OU PANEL, jamais les deux”

CoachRouter

choisit quel coach afficher selon le profil

NE CONTIENT AUCUNE LOGIQUE MÉTIER

Coach (Senior / Banquier / Commercial)

contient UNIQUEMENT :

les phases

les phrases

la navigation interne

ne décide JAMAIS de s’afficher ou non

🔐 SÉCURITÉ — CoachJail
📄 Fichier
ResultsDashboard.tsx

🎯 Rôle

Empêcher toute fuite d’affichage du coach côté client.

Fonctionnement
<CoachJail>
<CoachController />
</CoachJail>

Si isAdvisorScreen === false → RIEN ne s’affiche

C’est une barrière physique, pas un confort UX

👉 À NE JAMAIS SUPPRIMER

🔥 SWITCH GLOBAL — PRÉSENTATION OFF
État
const [isCoachDisabled, setIsCoachDisabled] = useState(false);

Effet

Coupe :

HUD

Panel

Alertes

Notifications

ZÉRO rendu coach

Règle

OFF = extinction totale, immédiate, irréversible tant que OFF

🧠 HUD — CoachCompassMinimal
📄 Fichier
/components/Coach/CoachCompassMinimal.tsx

Rôle

Guidance ultra-discrète

Visible uniquement par le conseiller

Sert de point d’entrée vers le panel

Caractéristiques

Fixé bas gauche

Cliquable → ouvre le panel

Affiche :

phase courante

phrase clé

action recommandée

timer de sécurité

⚠️ Règles

Ne contient AUCUNE logique métier

Ne connaît PAS le profil

Ne fait que réfléter l’état

📊 PANEL — Coach détaillé
Accès

Clic sur le HUD

Ou bouton Coach discret

Comportement

HUD disparaît

Panel prend le relais

❌ ferme le panel → HUD revient

Règle absolue

HUD et PANEL ne doivent JAMAIS coexister

🧠 CoachRouter
📄 Fichier
/coaches/CoachRouter.tsx

Rôle

Router vers le bon coach selon le profil

switch(profile) {
case "senior": return <SeniorCoach />
case "banquier": return <BanquierCoach />
default: return <CommercialCoach />
}

⚠️ Interdictions

❌ Pas de logique métier

❌ Pas de conditions d’affichage

❌ Pas de timers

👴 SeniorCoach / 💼 BanquierCoach / 🧱 CommercialCoach
📄 Dossiers
/coaches/
├── SeniorCoach.tsx
├── BanquierCoach.tsx
├── CommercialCoach.tsx

Responsabilités

Chaque coach :

affiche un panel latéral

gère sa navigation interne

informe le parent de la phase active

Interface commune
interface CoachProps {
onPhaseChange?: (phase) => void;
onClose?: () => void;
}

⚠️ Règles CRITIQUES

❌ Le coach ne décide PAS de s’ouvrir

❌ Le coach ne décide PAS de se fermer seul (sauf via onClose)

❌ Aucun coach ne connaît OFF / ON

❌ Aucun coach ne connaît le client UI

📚 PHASES — Le cœur du discours
📄 Fichiers
SeniorCoachPhases.ts
BanquierCoachPhases.ts
StandardCoachPhases.ts

Structure type
{
number: 3,
title: "Sécurité financière",
keyPhrase: "...",
currentAction: "...",
doList: [...],
dontList: [...],
minDuration: 90
}

SI TU VEUX MODIFIER LE DISCOURS

👉 TU MODIFIES ICI ET NULLE PART AILLEURS

❌ Ne jamais :

toucher au coach pour changer une phrase

injecter du copywriting dans un composant

🧠 PROFIL CLIENT — Dynamique & modifiable à chaud
Détection initiale

SpeechView (quiz)

Déclenche onProfileDetected(profile)

Synchronisation automatique
useEffect(() => {
if (data.profile !== profile) {
setProfile(data.profile);
}
}, [data.profile]);

Changement en RDV

Possible à tout moment

Effet immédiat :

phases changent

coach change

HUD s’adapte

Sans reload

Sans que le client le voie

🚨 ALERTES, RÈGLES, BLOQUAGES
Systèmes actifs

useAlertSystem

useVocabularyGuard

useSilenceTimer

useRDVState

Rôle

empêcher les erreurs graves

sécuriser les profils sensibles

contrôler le rythme du RDV

⚠️ Règle

Ces systèmes DOIVENT être désactivés quand OFF

🧪 PHASES DU PROJET (ROADMAP)
✅ Phase 1 — Architecture coach

✔️ DONE

🔒 Phase 2 — Règles non négociables

interdits verbaux

blocages modules

timers minimum

🧼 Phase 6 — Mode PROD

logs coupés

protections écran renforcées

variables d’environnement

🧠 Phase 7 — Apprentissage léger

micro-ajustements post RDV

feedback conseiller

🧬 Phase 8 — Scoring J+7

analyse à froid

corrélation discours / signature

🧘 CONCLUSION

Ce système est désormais :

✅ stable

✅ lisible

✅ maintenable

✅ sécurisé

✅ terrain-ready

✅ évolutif sans dette

👉 Si tu touches à :

CoachController

CoachRouter

Phases

fais-le en conscience.
Tout le reste peut évoluer sans risque.
README.md — BIBLE DU COACH (SYSTÈME DE GUIDAGE RDV)
🎯 Vision générale

Ce projet implémente un système de coaching en temps réel destiné uniquement au conseiller, pendant un rendez-vous client.

👉 Le client ne voit jamais le coach
👉 Le coach n’automatise pas la vente
👉 Le coach guide, sécurise et structure le discours humain

Le système est conçu pour :

s’adapter au profil psychologique du client

rester discret (HUD minimal)

permettre un pilotage actif (Panel)

être désactivable instantanément (OFF)

évoluer dans le temps sans dette technique

🧠 Architecture globale (qui dirige quoi)
ResultsDashboard
│
├── CoachJail → Sécurité écran (client vs conseiller)
│
├── CoachController → Orchestrateur UNIQUE du coach
│ │
│ ├── HUD (CoachCompassMinimal)
│ │ └── Guidance silencieuse (bas gauche)
│ │
│ └── PANEL (CoachRouter)
│ └── SeniorCoach | BanquierCoach | CommercialCoach
│
└── Modules métier (audit, graphes, calculs, etc.)

🧩 Principe clé

Un seul coach rendu à la fois.
Jamais deux.
Jamais en double.

🔐 Sécurité écran — CoachJail
🎯 Rôle

Empêcher tout affichage coach sur l’écran client (HDMI / partage écran).

Responsabilité

Si ce n’est pas l’écran conseiller → aucun rendu coach

Aucun display:none

Aucun DOM caché

⚠️ RÈGLE ABSOLUE

❌ Ne jamais contourner CoachJail
❌ Ne jamais rendre un coach hors de cette enveloppe

🎛️ CoachController — LE CERVEAU
🎯 Rôle

Point d’entrée unique du système coach.

Il décide :

si le coach est ON / OFF

si on affiche le HUD ou le PANEL

quel coach afficher selon le profil

quand le HUD revient

quand le panel se ferme

👉 Aucune logique coach ne doit vivre ailleurs.

États clés
isCoachDisabled // kill switch total
coachView // "hud" | "panel"
profile // senior | banquier | standard

⚠️ ZONE GELÉE (PROD)

❌ Ne pas modifier :

logique ON / OFF

logique HUD ↔ PANEL

routing des coaches

🧭 HUD — CoachCompassMinimal
🎯 Rôle

Guidance silencieuse, ultra-discrète, non intrusive.

Affiche :

phase actuelle

phrase clé

action immédiate

progression temporelle

Interaction

clic → ouvre le panel

aucune autre action

Règles

✔️ Toujours visible quand coach actif
✔️ Jamais visible en même temps que le panel
✔️ Jamais bloquant

📊 PANEL — Coaches métier
Règle fondamentale

Les coaches NE GÈRENT PAS leur ouverture / fermeture.

Ils :

affichent le contenu

notifient la phase active

demandent la fermeture (onClose)

Le parent décide.

👴 SeniorCoach / 💼 BanquierCoach / 💬 CommercialCoach
🎯 Rôle

Afficher le script adapté au profil client.

Chaque coach :

reçoit onPhaseChange

reçoit onClose

gère UNIQUEMENT :

l’affichage

la navigation interne

le contenu des phases

✅ Ce qu’on peut modifier sans risque

textes

phrases clés

doList / dontList

ordre des phases

labels visuels

❌ Ce qu’on ne modifie PAS

gestion HUD / PANEL

logique de fermeture

routing profil

🔁 CoachRouter
🎯 Rôle

Sélectionner le bon coach selon le profil courant.

profile === "senior" → SeniorCoach
profile === "banquier" → BanquierCoach
profile === "standard" → CommercialCoach

Important

Le profil peut changer à chaud en RDV

Le router s’adapte automatiquement

🧠 Gestion du profil client
Origine

détecté par SpeechView

stocké dans ResultsDashboard

peut être modifié manuellement en RDV

Effet

changement immédiat des phases

changement du coach actif

aucun reload

invisible pour le client

🛑 Bouton PRÉSENTATION OFF
🎯 Rôle

Couper TOUT le système coach instantanément.

Effets :

HUD disparaît

panel disparaît

alertes stoppées

timers stoppés

Usage terrain

client regarde l’écran

moment sensible

besoin de silence

🔒 PHASE 6 — MODE PROD (EN PLACE)
Actif :

logs contrôlés

OFF sécurisé

aucun affichage client

architecture figée

⚠️ À NE PAS FAIRE EN PROD

ajouter des console.log

rendre un coach hors CoachJail

dupliquer un coach

🧠 PHASE 7 — APPRENTISSAGE LÉGER
Principe

Pas d’IA lourde.
Juste des signaux terrain.

On observe :

temps par phase

alertes déclenchées

OFF utilisé

changement de profil

On ajuste :

textes

timings

seuils

👉 Le coach apprend, mais l’humain décide.

🧬 PHASE 8 — SCORING J+7
Pourquoi J+7

recul émotionnel

objections réelles

signature connue

Objectif

Améliorer :

scripts

séquences

profils

taux de closing réel

👉 Ce score n’est jamais une sanction.

🏁 CONCLUSION

Ce système n’est pas :
❌ un bot
❌ une IA vendeuse
❌ une automatisation agressive

C’est :
✅ un copilote humain
✅ un garde-fou émotionnel
✅ un structurant de discours
✅ un outil durable
