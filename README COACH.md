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
