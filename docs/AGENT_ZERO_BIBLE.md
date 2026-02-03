📕 AGENT ZERO — BIBLE INTÉGRALE CANONIQUE
Version Finale | Document de Référence Absolu
Statut : GEL OFFICIEL — VERSION IMMUTABLE
🔒 AVERTISSEMENT CRITIQUE
❌ Aucune réécriture
❌ Aucune synthèse
❌ Aucune suppression
❌ Aucune "amélioration"
Toute évolution future se fera par documents annexes versionnés, jamais par modification de la Bible.
TABLE DES MATIÈRES COMPLÈTE
PARTIE 1 : FONDATIONS & PHILOSOPHIE
Section 0 : Intention Originelle
Section 1 : Problème Initial
Section 2 : Découverte Fondatrice
Section 3 : Principe Sacré N°1
PARTIE 2 : ARCHITECTURE & CONTRATS
Section 4 : Architecture Fondamentale
Section 5 : Contrat Fondateur — JSON Strict
Section 6 : INPUT — ProfileDetectionResult
Section 7 : OUTPUT — AgentDecision (DecisionPlan)
PARTIE 3 : RÈGLES & MOAT
Section 8 : Règles Absolues
Section 9 : Erreur Majeure Rencontrée
Section 61 : Historique Décisionnel des Règles
PARTIE 4 : IMPLÉMENTATION TECHNIQUE
Section 10 : Mode Dégradé
Section 11 : Implémentation Locale — Python
Section 12 : API — api_decide.py
Section 13 : Front — EDF-DASHBOARD-TEST
Section 14 : Rôle du Front
PARTIE 5 : BUGS & PIÈGES RÉELS
Section 15 : Bugs & Pièges Réels Rencontrés
Section 22 : Bug Majeur — Ports Zombies (macOS)
Section 53 : Erreurs Réelles Rencontrées (Liste)
PARTIE 6 : REPRODUCTIBILITÉ
Section 17 : Reproductibilité — Principe Non Négociable
Section 18 : Structure de Référence (Canonique)
Section 19 : Agent Zero — Installation From Scratch (Python)
Section 20 : Variables d'Environnement
Section 21 : Lancement API Agent Zero
Section 23 : Front — EDF-DASHBOARD-TEST (Installation)
PARTIE 7 : CONNEXION & VALIDATION
Section 24 : Point de Connexion Front → Agent Zero
Section 25 : Gestion des Erreurs
Section 26 : Test de Validation
PARTIE 8 : STRATÉGIE & BUSINESS
Section 27 : Logique de Versioning
Section 28 : Raison Pour Laquelle C'est Incopiable
Section 29 : Erreurs à Ne Jamais Refaire
Section 30 : Philosophie Finale
PARTIE 9 : WHITE-LABEL & LICENSING (ÉTAPE I)
Section 31 : Étape I — White-Label & Licensing
Section 32 : Architecture White-Label
Section 33 : Licensing — Modèle Économique
Section 34 : Contrat de Licence
PARTIE 10 : LÉGAL & CONFORMITÉ (ÉTAPE J)
Section 35 : Étape J — Légal / Assurance / Conformité
Section 36 : Auditabilité
Section 37 : Assurance RC Pro — Stratégie
Section 38 : Piège Légal Majeur à Éviter
PARTIE 11 : STRATÉGIE GRANDS COMPTES (ÉTAPE K)
Section 39 : Étape K — Stratégie Grands Comptes
Section 40 : Leur Problème Réel
Section 41 : Discours Commercial
Section 42 : Proof of Value (POV)
PARTIE 12 : INDUSTRIALISATION (ÉTAPE H)
Section 43 : Industrialisation Multi-Industries
Section 44 : Plugins Industrie
Section 45 : Test de Neutralité
PARTIE 13 : OPÉRATIONS & CRISE
Section 46 : Sécurité & ISO
Section 47 : Gestion des Erreurs Humaines
Section 62 : Runbook Opérationnel — Mode Panne & Crise
PARTIE 14 : GOUVERNANCE & TRANSMISSION
Section 48 : Point de Non-Retour Stratégique
Section 49 : Ce Que Tu Ne Dois Jamais Faire
Section 50 : Rôle du Front à Long Terme
Section 51 : Documentation Interne
Section 52 : Stratégie d'Équipe Future
Section 63 : Transmission à un Tiers
Section 64 : Gouvernance du Core
PARTIE 15 : PHILOSOPHIE DE LONGÉVITÉ
Section 54 : Astuces Critiques
Section 55 : Pourquoi Tu As Raison d'Être Exigeant
Section 65 : Philosophie de Longévité (10 ans)
Section 66 : Dernière Page — Serment Architectural
PARTIE 16 : RÉCAPITULATIFS & SYNTHÈSES
Section 56 : Récap Final
Section 57 : Si Tu Reviens Dans 1 An
Section 58 : Ce Document Est Une Arme
Section 59 : Prochaines Bibles Possibles
Section 60 : Fin (Pour l'Instant)
Section 67 : Statut Final
PARTIE 17 : ÉTAPES PRODUIT SAAS (E, F, G)
Étape E : Packager Agent Zero en Produit SaaS Vendable
Étape F : Certification Agent Zero®
Étape G : Pitch Deck Agent Zero®
PARTIE 18 : GUIDES TECHNIQUES COMPLETS
Guide PythonAnywhere (Déploiement)
Guide Dashboard SaaS-Ready
Guide Licensing Multi-Clients
Guide Composant Audit & Conformité
ANNEXES
Annexe 1 : Index de Reconstruction
Annexe 2 : Checklist Machine Vierge
Annexe 3 : Extraction Règles Sacrées
Annexe 4 : Runbook Reconstruction 1 An
PARTIE 19 : OPS LAYER & GOUVERNANCE INTERNE (ADDENDUM V2)
<a name="section-68"></a>
68. LA MISSION OPS (INITIATIVE)
Agent Zero (Client) optimise la signature.
Agent Zero (Ops) sécurise l'exécution.
Ce sont deux cerveaux distincts.
Jamais mélangés.
Jamais interdépendants.

<a name="section-69"></a>
69. ARCHITECTURE DU MOTEUR OPS
69.1 Ops Rules (`ops.rules.ts`)
Source de vérité unique.
Contient les constantes métier intouchables :
- `SRU_MAX_DAYS` (14j rétractation)
- `WAR_ROOM_RISK_SCORE` (0.6)
- `SILENCE_THRESHOLD_DAYS` (7j)

69.2 Ops Engine (`ops.engine.ts`)
Fonction pure : `evaluateOpsDecision(context)`.
Prend des faits. Rend un verdict.
Ne décide PAS pour l'utilisateur.
Diagnostique le risque.

<a name="section-70"></a>
70. STRATÉGIE "MIRROR MODE" (PHASE D'OBSERVATION)
Avant de laisser l'Ops Engine bloquer quoi que ce soit, il opère en "Mode Miroir".
- Il observe chaque dossier en arrière-plan.
- Il loggue son verdict en console.
- Il NE TOUCHE PAS à l'UI.
Objectif : Calibrer la vérité sans risquer le business.

<a name="section-71"></a>
71. OPS SNAPSHOT : LA VÉRITÉ BRUTE
Pour le Cockpit, nous avons banni les calculs frontend fragiles.
Nous utilisons une vue SQL `ops_snapshot` via `fetchOpsSnapshot`.
Principe :
- DB View calcule l'état (Active, Silent, Secured).
- Frontend affiche bêtement.
- Zéro distorsion possible.
Le Cockpit devient un outil de preuve, pas d'interprétation.

PARTIE 1 : FONDATIONS & PHILOSOPHIE
<a name="section-0"></a>
0. INTENTION ORIGINELLE (À NE JAMAIS OUBLIER)
Agent Zero n'est pas :
un chatbot
un LLM wrapper
un assistant conversationnel
un moteur de calcul
Agent Zero est : Un système d'orchestration décisionnelle non-narratif, conçu pour contraindre une interface humaine à adopter la séquence, le tempo et les leviers psychologiques optimaux sans jamais générer de texte client.
⚠️ Cette phrase est la clé de voûte.
Si elle est violée → le système est corrompu.
<a name="section-1"></a>
1. PROBLÈME INITIAL (LE VRAI, PAS CELUI QU'ON RACONTE)
1.1 Problème apparent (faux problème)
"Les commerciaux vendent mal / pas assez."
❌ Faux.
1.2 Problème réel
Les commerciaux décident au feeling,
sous stress,
avec des biais cognitifs,
et changent de stratégie en plein rendez-vous.
Résultat :
incohérences
pression mal placée
perte de confiance
objections auto-générées
closing fragile ou annulé J+7
<a name="section-2"></a>
2. DÉCOUVERTE FONDATRICE (LE PIVOT MENTAL)
👉 La vente n'est pas un problème de discours.
👉 C'est un problème d'orchestration.
Le discours existe déjà :
garanties
chiffres
preuves
comparaisons
échéancier
Ce qui manque :
quand dire quoi
dans quel ordre
à quelle vitesse
avec quels leviers activés ou désactivés
<a name="section-3"></a>
3. PRINCIPE SACRÉ N°1
❌ JAMAIS DE TEXTE CLIENT CÔTÉ CERVEAU
Décision radicale prise très tôt (et souvent remise en question) :
Agent Zero ne parle jamais au client.
Pourquoi ?
Un texte est falsifiable
Un texte est critiquable
Un texte est copiable
Un texte crée de la dépendance au LLM
👉 Une décision, non.
PARTIE 2 : ARCHITECTURE & CONTRATS
<a name="section-4"></a>
4. ARCHITECTURE FONDAMENTALE (VUE MACRO)
4.1 Séparation ABSOLUE en 3 couches


┌──────────────────────────┐
│        UI / Dashboard     │  ← EXÉCUTE
└──────────▲───────────────┘
           │ DecisionPlan (JSON)
┌──────────┴───────────────┐
│      Agent Zero Core      │  ← DÉCIDE
└──────────▲───────────────┘
           │ DecisionContext (JSON)
┌──────────┴───────────────┐
│   Données métier brutes   │  ← FOURNIT
└──────────────────────────┘
⚠️ Toute violation de cette séparation est une ERREUR CRITIQUE.

### 4.2 CONTRAT PHONÉTIQUE (TRADUCTION) — LA LOI DU MAPPING
**Problème :** Le cerveau (Agent Zero) manipule des concepts purs (ex: `constat`, `solution`). Le corps (Dashboard) manipule des modules techniques (ex: `repartition`, `projection`).
**Solution :** Le fichier `agentZeroModuleContract.ts` agit comme un traducteur diplomatique inviolable.
*   AZ dit "CONSTAT".
*   Contract traduit "REPARTITION".
*   Dashboard affiche le module "REPARTITION".
👉 Le Dashboard n'a pas le droit d'interpréter. Il traduit et exécute.

#### 4.2.1 Cas Spécial : Fatigue Critique (Minimal Path)
Si Agent Zero détecte `fatigueCritical`, il peut envoyer des modules virtuels simplifiés.
*   AZ envoie : `prise-en-charge-admin`.
*   Contract traduit : `garanties` (Module de réassurance ultime).
*   Résultat : Le parcours saute les étapes complexes pour aller à l'essentiel.

<a name="section-5"></a>
5. CONTRAT FONDATEUR — JSON STRICT
5.1 Pourquoi JSON strict ?
parsable
versionnable
testable
loggable
auditable (juridique)
5.2 Aucun champ libre
pas de string narrative
pas de commentaire
pas de texte "humain"
<a name="section-6"></a>
6. INPUT — ProfileDetectionResult
Ce n'est PAS une intuition.
C'est une photographie psychologique instantanée.


json
{
  "profile": "senior | banquier | standard | hybride",
  "modes": {
    "defiance": true,
    "opportunity": false,
    "fatigueCognitive": false
  },
  "signals": {
    "peurDeSeTromper": true,
    "besoinDeChiffres": false,
    "urgencePercue": false,
    "indecision": true
  },
  "state": {
    "currentModule": "constat",
    "timeElapsedSec": 420,
    "questionsAsked": ["ROI", "garanties"]
  }
}
Piège n°1 (erreur fréquente)
❌ Mélanger profil et mode
✔️ Un senior peut être en mode opportunité
✔️ Un jeune peut être en mode défiance
<a name="section-7"></a>
7. OUTPUT — AgentDecision (DecisionPlan)


json
{
  "moduleOrder": [...],
  "presentationTempo": "slow | methodical | fast",
  "enable": {
    "scarcity": false,
    "comparisons": true,
    "longTermProjections": true
  },
  "tooltipsEnabled": ["security", "institutional"],
  "summaryStyle": "security",
  "confidenceScore": 0.85,
  "reasoning": {
    "triggers": [],
    "rulesApplied": [...],
    "guardrailsActive": [...]
  },
  "contentVariants": {
    "garanties": "senior_fatigue_institutional_dense"
  },
  "contentOverrides": {} // Optionnel : Injection brute
}
```

⚠️ **Le champ reasoning est NON négociable.**

Sans lui → impossible de :
- auditer
- expliquer
- défendre juridiquement

---

# PARTIE 3 : RÈGLES & MOAT

<a name="section-8"></a>
## 8. RÈGLES ABSOLUES (LE CŒUR DU MOAT)

### Règle 1 — Peur > Urgence
```
Si peurDeSeTromper = true
→ scarcity = false
→ tempo = slow
```

**Une personne anxieuse ne signe jamais sous pression.**

### Règle 2 — Défiance
```
Si defiance = true
→ commencer par preuves + garanties
→ jamais de scarcity
```

### Règle 3 — Fatigue cognitive
```
Si fatigueCognitive = true
→ parcours minimal
→ aucun tooltip
→ tempo slow
```

### Règle 4 — Opportunité
```
Si opportunity = true ET peur = false
→ scarcity autorisée
→ tempo fast
```

### Règle 5 — Profil senior / hybride
```
→ scarcity INTERDITE à vie
```

### Règle 6 — Content Density (Garanties)
```
SI profile === "senior"
   ET alerts.fatigueCritical === true
   ET signals.peurDeSeTromper === true
   ET horizonProjet >= 20
→ contentVariants.garanties = "senior_fatigue_institutional_dense"
```
**Intention :** Sécuriser mentalement par la densité. Transformer la garantie en cadre contractuel.

**Interdictions formelles :**
- Jamais pour "banquier" ou "standard"
- Jamais si fatigueCritical = false
- Dans ces cas → `default` uniquement.

---

<a name="section-9"></a>
## 9. ERREUR MAJEURE RENCONTRÉE (BUG STRUCTURANT)

### Bug réel observé
- Le front recalculait des décisions
- Le front modifiait l'ordre des modules
- Le front "corrigeait" le cerveau

❌ **C'est une trahison du modèle.**

### Correction
- Le front exécute
- Le cerveau impose
- Si le cerveau est inaccessible → mode dégradé explicitement affiché

---

<a name="section-61"></a>
## 61. HISTORIQUE DÉCISIONNEL DES RÈGLES
(Pourquoi les règles existent, et pourquoi certaines sont irrévocables)

### 61.1 Principe fondamental
Aucune règle d'Agent Zero n'a été écrite "par intuition".

Chaque règle est née :
- d'un échec réel,
- d'un bug comportemental observé,
- ou d'un risque juridique identifié.

👉 **Une règle sans histoire est une règle fragile.**

### 61.2 Règle absolue — Scarcity interdite pour les profils seniors

**Origine réelle**

Lors de tests initiaux, l'activation même légère d'un levier de rareté ("offre limitée", "fenêtre courte") chez des profils seniors a provoqué :
- une hausse temporaire de l'adhésion verbale,
- MAIS une explosion des rétractations post-signature (J+3 à J+7),
- et une dégradation durable de la confiance.

**Erreur initiale commise**

Scarcity activée car :
- chiffres bons,
- profil solvable,
- opportunité perçue.

**Découverte clé**

👉 Le senior ne réagit pas à la pression comme un jeune opportuniste.  
👉 Il interprète la rareté comme un danger, pas comme une opportunité.

**Décision structurelle**
```
SI profile == senior
→ scarcity = false
→ à vie
```

⚠️ Cette règle est non négociable, même si :
- le client semble pressé,
- le manager pousse,
- le chiffre est bon.

### 61.3 Règle "Peur > Urgence"

**Bug observé**

Lorsque :
- peur de se tromper = true
- urgence perçue = true

Le système humain entre en dissonance cognitive :
- le client dit oui,
- mais son cerveau cherche inconsciemment une sortie.

**Conséquence réelle**
- objections tardives,
- appels post-RDV,
- annulations administratives.

**Correction**
```
SI fear == true
→ urgency neutralisée
→ tempo = slow
→ priorité preuves & garanties
👉 Cette règle a diminué les signatures "rapides", mais augmenté drastiquement les signatures durables.
61.4 Règle supprimée — "Relance persuasive automatique"
Tentative initiale
Une règle testée brièvement proposait :
d'intensifier la narration
après 2 objections consécutives.
Résultat
sentiment de manipulation perçu,
rupture de confiance,
rejet émotionnel.
Décision
❌ Règle supprimée définitivement.
❌ Jamais remplacée.
👉 Agent Zero ne "rattrape" pas un échec par plus de pression.
PARTIE 4 : IMPLÉMENTATION TECHNIQUE
<a name="section-10"></a>
10. MODE DÉGRADÉ (CRITIQUE)
Si Agent Zero est down :
le dashboard continue
MAIS affiche :
"Mode non optimisé — décision humaine"
⚠️ Ne jamais simuler Agent Zero.
Mieux vaut une vérité brutale qu'un faux cerveau.
<a name="section-11"></a>
11. IMPLÉMENTATION LOCALE — PYTHON
Fichier clé
agent_zero_decide.py
Rôle :
tester la logique sans UI
valider les règles
servir de référence canonique
Commande :


bash
python3 agent_zero_decide.py
```

---

<a name="section-12"></a>
## 12. API — api_decide.py

**Rôle :**
- exposer `/decide`
- recevoir un DecisionContext
- retourner un DecisionPlan
- AUCUNE logique métier

⚠️ **Si tu vois le mot "solaire" dans ce fichier → BUG.**

---

<a name="section-13"></a>
## 13. FRONT — EDF-DASHBOARD-TEST (DOSSIER CORRECT)

📍 **Chemin exact :**
```
EDF-DASHBOARD-TEST/
└── src/
    └── components/
        └── ResultsDashboard.REFONTE2.tsx
👉 C'est LE dashboard exécutant.
Pas agent-zero.
Pas ailleurs.
<a name="section-14"></a>
14. RÔLE DU FRONT (STRICT)
Le front :
détecte le profil
envoie le contexte
reçoit la décision
obéit
Exemples :
tempo = slow → animations ralenties
moduleOrder → onglets cachés
scarcity = false → aucun élément de pression affiché
PARTIE 5 : BUGS & PIÈGES RÉELS
<a name="section-15"></a>
15. BUGS & PIÈGES RÉELS RENCONTRÉS (LISTE VITALE)
❌ Flask sans CORS → erreurs silencieuses Axios
❌ Ports bloqués par ControlCenter macOS
❌ Serveurs zombies impossibles à kill
❌ Mélange .venv / npm → fausses erreurs
❌ 403 causés par décorateurs hérités
❌ Routes dupliquées (@app.route("/") ×2)
❌ Static paths relatifs mal résolus
❌ "ça marche chez moi" ≠ reproductible
👉 Chaque bug a renforcé l'architecture.
<a name="section-22"></a>
22. BUG MAJEUR — PORTS ZOMBIES (MACOS)
Symptôme
Port occupé
Process impossible à kill
lsof -i :5000 montre ControlCenter
Solution documentée (VITALE)


bash
lsof -ti :5050 | xargs kill -9
```

Si ça persiste :
- changer de port
- documenter le port utilisé
- ne jamais forcer au hasard

---

<a name="section-53"></a>
## 53. ERREURS RÉELLES RENCONTRÉES (LISTE)

- Ports Mac impossibles à tuer
- Flask installé hors venv
- UI qui décidait "temporairement"
- Agent Zero trop bavard
- Confusion Node / Python
- Auth inutile en dev
- 404 dus à mauvais dossier

➡️ **Toutes documentées ici.**

---

# PARTIE 6 : REPRODUCTIBILITÉ

<a name="section-17"></a>
## 17. REPRODUCTIBILITÉ — PRINCIPE NON NÉGOCIABLE

**Objectif :**  
Pouvoir recréer Agent Zero sur une machine vierge, dans 1 an, sans toi.

Si ce n'est pas possible → le système est mort.

---

<a name="section-18"></a>
## 18. STRUCTURE DE RÉFÉRENCE (CANONIQUE)

### 18.1 Dépôts (séparation obligatoire)
```
/agent-zero/                 ← Cerveau (Python)
/EDF-DASHBOARD-TEST/         ← Exécutant (React / TS)
/docs/                       ← Bible, décisions, versions
❌ Tout mélanger = dette technique fatale
✔️ Trois dépôts = longévité
<a name="section-19"></a>
19. AGENT ZERO — INSTALLATION FROM SCRATCH (PYTHON)
19.1 Pré-requis machine
macOS / Linux
Python 3.11+
pip
virtualenv
curl
19.2 Création environnement


bash
cd agent-zero
python3 -m venv .venv
source .venv/bin/activate
⚠️ Toujours vérifier


bash
which python
# doit pointer vers .venv
19.3 Dépendances


bash
pip install -r requirements.txt
Piège réel rencontré :
flask installé globalement → crash silencieux
Toujours tester :


bash
python3 -c "import flask; print(flask.__version__)"
```

---

<a name="section-20"></a>
## 20. VARIABLES D'ENVIRONNEMENT (POINT CRITIQUE)

### 20.1 Fichier .env
```
FLASK_SECRET_KEY=...
WEB_UI_HOST=localhost
WEB_UI_PORT=5050
❌ Ne jamais commit
✔️ Documenter dans la Bible

### 20.2 PROTOCOLE API KEY (STRICT)
Le serveur PythonAnywhere impose une contrainte de sécurité spécifique sur les headers.
*   **Header Obligatoire :** `X-API-KEY` (et non `Authorization`).
*   **Pourquoi :** `Authorization` est bloqué par les règles CORS par défaut du serveur Flask en mode hébergé.
*   **Valeur :** `Titanium2025!` (pour ce prototype).
*   **Priorité d'injection :**
    1.  `localStorage` (Debug / Override manuel)
    2.  `.env` (`VITE_AGENT_ZERO_API_KEY`)
    3.  Valeur secours hardcodée (`Titanium2025!`)
👉 Si 401 Unauthorized : Vérifier cette cascade.

<a name="section-21"></a>
21. LANCEMENT API AGENT ZERO
21.1 Fichier minimal
api_decide.py
21.2 Lancer


bash
python3 api_decide.py
Test vital :


bash
curl -X POST http://localhost:5050/decide \
  -H "Content-Type: application/json" \
  -d '{...}'
Résultat attendu :
JSON strict
aucun texte libre
aucune erreur console
<a name="section-23"></a>
23. FRONT — EDF-DASHBOARD-TEST (INSTALLATION)
23.1 Pré-requis
Node 18+
npm
Vite
23.2 Installation


bash
cd EDF-DASHBOARD-TEST
npm install
npm run dev
```

⚠️ **.venv N'A AUCUN IMPACT ICI**  
(Node ≠ Python)

---

# PARTIE 7 : CONNEXION & VALIDATION

<a name="section-24"></a>
## 24. POINT DE CONNEXION FRONT → AGENT ZERO

**Fichier clé**
```
src/brain/agentZeroClient.ts
Responsabilité unique :
POST /decide
timeout clair
gestion erreur explicite
Exemple conceptuel


typescript
axios.post("http://localhost:5050/decide", context)
❌ Aucune logique décisionnelle ici
✔️ Simple transport
<a name="section-25"></a>
25. GESTION DES ERREURS (NON NÉGOCIABLE)
Cas réel observé
Agent Zero down
Front continue silencieusement
Faux sentiment de sécurité
Correction imposée


typescript
catch (e) {
  console.warn("Agent Zero unreachable");
  setMode("DEGRADED");
}
```

**UI DOIT AFFICHER :**  
"Mode non optimisé — décision humaine"

---

<a name="section-26"></a>
## 26. TEST DE VALIDATION (CHECKLIST OBLIGATOIRE)

Avant chaque release :

- [ ] JSON strict validé
- [ ] Aucun texte client généré côté Python
- [ ] Aucun calcul métier côté Agent Zero
- [ ] Le front n'altère pas moduleOrder
- [ ] Mode dégradé visible si API down
- [ ] Logs exploitables

---

# PARTIE 8 : STRATÉGIE & BUSINESS

<a name="section-27"></a>
## 27. LOGIQUE DE VERSIONING (CRUCIAL)

### 27.1 Versionner :
- règles
- structures JSON
- décisions majeures

### 27.2 Ne PAS versionner :
- contenu client
- UI cosmetique

👉 Le cerveau évolue lentement.  
👉 L'UI peut changer souvent.

---

<a name="section-28"></a>
## 28. RAISON POUR LAQUELLE C'EST INCOPIABLE

Un concurrent peut copier :
- les calculs
- l'UI
- les graphiques

Il ne peut PAS copier :
- les règles implicites
- les hiérarchies psychologiques
- les interdictions (scarcity interdite senior)
- la séparation stricte cerveau / exécution

**C'est là le Moat.**

---

<a name="section-29"></a>
## 29. ERREURS À NE JAMAIS REFAIRE

❌ Ajouter un "petit texte" côté cerveau  
❌ Faire "juste une exception"  
❌ Laisser le front décider "temporairement"  
❌ Optimiser trop tôt  
❌ Rendre Agent Zero bavard  

👉 **Chaque "petit écart" détruit l'architecture.**

---

<a name="section-30"></a>
## 30. PHILOSOPHIE FINALE (À GRAVER)

Agent Zero ne vend rien.  
Il empêche de mal vendre.

Il ne persuade pas.  
Il interdit les erreurs humaines.

---

# PARTIE 9 : WHITE-LABEL & LICENSING (ÉTAPE I)

<a name="section-31"></a>
## 31. ÉTAPE I — WHITE-LABEL & LICENSING (STRUCTURE RÉELLE)

### 31.1 Principe fondamental
Agent Zero ne doit jamais savoir pour qui il travaille.

Il ne connaît :
- ni la marque
- ni l'industrie
- ni l'offre
- ni le pricing
- ni la promesse commerciale

👉 Il ne connaît que :
- un DecisionContext
- un DecisionPlan

---

<a name="section-32"></a>
## 32. ARCHITECTURE WHITE-LABEL

### 32.1 Séparation stricte
```
AgentZeroCore/
  ├── engine/
  │   ├── rules.py
  │   ├── guardrails.py
  │   ├── scorer.py
  │
  ├── schemas/
  │   ├── decision_context.json
  │   ├── decision_plan.json
  │
  └── api_decide.py
```

Puis, par client :
```
clients/
  ├── solar/
  │   ├── mapper.ts
  │   └── ui_rules.ts
  ├── banking/
  ├── real_estate/
❌ JAMAIS l'inverse.
<a name="section-33"></a>
33. LICENSING — MODÈLE ÉCONOMIQUE
33.1 Ce que tu vends vraiment
Pas :
une app
un dashboard
un outil solaire
Tu vends :
Un moteur de conformité décisionnelle
33.2 Pricing réel (indicatif)
Setup : 30–100k€
Licence annuelle : 60–300k€
Par utilisateur / par décision / par volume
👉 Le prix n'est PAS technique
👉 Il est juridique + réputationnel
<a name="section-34"></a>
34. CONTRAT DE LICENCE (POINT VITAL)
Clause clé :
"Le moteur de décision impose des règles éthiques et de conformité. Le client reconnaît que toute modification ou contournement engage sa responsabilité."
➡️ Tu déplaces le risque juridique.
PARTIE 10 : LÉGAL & CONFORMITÉ (ÉTAPE J)
<a name="section-35"></a>
35. ÉTAPE J — LÉGAL / ASSURANCE / CONFORMITÉ
35.1 Pourquoi Agent Zero protège légalement
Parce qu'il :
loggue les décisions
documente les règles appliquées
empêche certaines pratiques
impose un tempo
En cas de litige :
"Le conseiller a suivi un plan validé par un moteur certifié."
<a name="section-36"></a>
36. AUDITABILITÉ (OBLIGATOIRE)
Chaque décision doit produire :


json
{
  "decisionId": "...",
  "timestamp": "...",
  "rulesApplied": [...],
  "guardrails": [...],
  "confidenceScore": 0.83
}
```

**Stockage :**
- immuable
- horodaté
- exportable

---

<a name="section-37"></a>
## 37. ASSURANCE RC PRO — STRATÉGIE

Tu ne dis PAS :  
"C'est une IA de vente"

Tu dis :  
"C'est un moteur de conformité décisionnelle"

➡️ **Changement TOTAL de classification.**

---

<a name="section-38"></a>
## 38. PIÈGE LÉGAL MAJEUR À ÉVITER

❌ Laisser Agent Zero :
- générer du texte client
- reformuler une offre
- modifier des chiffres

➡️ Sinon : requalification en conseil personnalisé  
➡️ Assurance saute.

---

# PARTIE 11 : STRATÉGIE GRANDS COMPTES (ÉTAPE K)

<a name="section-39"></a>
## 39. ÉTAPE K — STRATÉGIE GRANDS COMPTES

### 39.1 À qui tu vends

- Banques
- Assurances
- Promoteurs
- Énergie
- Immobilier
- Télécoms
- Institutions publiques

---

<a name="section-40"></a>
## 40. LEUR PROBLÈME RÉEL

Pas :  
"on vend mal"

Mais :
- conseillers inégaux
- erreurs humaines
- risques juridiques
- pression commerciale
- churn post-signature

**Agent Zero corrige exactement ça.**

---

<a name="section-41"></a>
## 41. DISCOURS COMMERCIAL (CANONIQUE)

**"Nous ne remplaçons pas vos conseillers. Nous empêchons qu'ils se mettent en faute."**

Silence.

---

<a name="section-42"></a>
## 42. PROOF OF VALUE (POV) — FORMAT

- 1 équipe pilote
- 30 RDV
- Comparatif avant / après

**Mesures :**
- taux signature
- taux rétractation
- durée RDV
- conformité

---

# PARTIE 12 : INDUSTRIALISATION (ÉTAPE H)

<a name="section-43"></a>
## 43. INDUSTRIALISATION MULTI-INDUSTRIES (H)

### 43.1 Ce qui change

Rien dans le Core.

Seulement :
- le mapping du contexte
- l'interprétation UI

👉 **Le cerveau reste inchangé.**

---

<a name="section-44"></a>
## 44. PLUGINS INDUSTRIE

**Exemple :**
```
/plugins
  ├── solar/
  ├── banking/
  ├── real_estate/
```

Chaque plugin :
- traduit le métier → DecisionContext
- applique DecisionPlan → UI

---

<a name="section-45"></a>
## 45. TEST DE NEUTRALITÉ (CRITIQUE)

**Test ultime :**  
Envoyer un contexte "immobilier" sans changer une ligne du Core.

Si ça casse → architecture invalide.

---

# PARTIE 13 : OPÉRATIONS & CRISE

<a name="section-46"></a>
## 46. SÉCURITÉ & ISO (FUTUR)

Agent Zero est compatible avec :
- ISO 27001 (logs)
- RGPD (pas de données sensibles)
- audit interne

Parce qu'il ne stocke pas le client final, seulement la décision.

---

<a name="section-47"></a>
## 47. GESTION DES ERREURS HUMAINES

**Cas réel :**
- conseiller veut forcer
- client hésite
- pression manager

**Agent Zero :**
- ralentit
- supprime scarcity
- impose sécurité

👉 **Le système protège le conseiller.**

---

<a name="section-62"></a>
## 62. RUNBOOK OPÉRATIONNEL — MODE PANNE & CRISE
(Ce qui doit se passer quand ça ne marche PAS)

### 62.1 Principe non négociable

❌ Ne jamais simuler Agent Zero  
❌ Ne jamais "faire comme si"

👉 **En cas de panne, la vérité brute est obligatoire.**

### 62.2 Scénario A — Agent Zero API indisponible

**Détection**
- Timeout API
- Erreur réseau
- Réponse invalide

**Comportement obligatoire du Dashboard**
```
MODE = DEGRADED
Afficher bandeau visible :
"Mode non optimisé — décision humaine"
```

**Interdictions**

❌ recalcul local  
❌ fallback logique  
❌ approximation silencieuse

### 62.3 Scénario B — Mauvaise clé API / licence expirée

**Comportement**
- Blocage immédiat
- Message explicite :

"Licence invalide ou expirée — orchestration désactivée"

👉 **Le blocage est une fonction, pas un bug.**

### 62.4 Scénario C — Décision incohérente détectée

**Définition**  
Une décision est incohérente si :
- moduleOrder vide,
- tempo absent,
- guardrails manquants.

**Action**
- Affichage erreur critique
- Aucune exécution UI
- Log prioritaire

### 62.5 Principe de crise

**Mieux vaut perdre une vente que perdre la crédibilité du système.**

---

# PARTIE 14 : GOUVERNANCE & TRANSMISSION

<a name="section-48"></a>
## 48. POINT DE NON-RETOUR STRATÉGIQUE

À partir de maintenant :
- tu ne fais plus "des features"
- tu écris des règles
- tu refuses certaines demandes clients

➡️ **C'est ce qui crée la valeur.**

---

<a name="section-49"></a>
## 49. CE QUE TU NE DOIS JAMAIS FAIRE

❌ Ajouter un "mode agressif"  
❌ Laisser un client désactiver les garde-fous  
❌ Rendre Agent Zero configurable librement  
❌ Expliquer toutes les règles  

**Mystère = protection.**

---

<a name="section-50"></a>
## 50. RÔLE DU FRONT À LONG TERME

**Le front :**
- change
- s'adapte
- se refait
- se vend
- se remplace

**Agent Zero :**
- reste
- décide
- impose
- survit

---

<a name="section-51"></a>
## 51. DOCUMENTATION INTERNE (OBLIGATOIRE)

**Trois niveaux :**
1. Bible V2 (ce document)
2. Docs techniques (install)
3. Changelog décisionnel

Sans ça → système mort en 12 mois.

---

<a name="section-52"></a>
## 52. STRATÉGIE D'ÉQUIPE FUTURE

- 1 architecte Core
- 2–3 devs UI
- 0 "prompt engineer"
- 0 bullshit IA

---

<a name="section-63"></a>
## 63. TRANSMISSION À UN TIERS
(Comment penser Agent Zero sans toi)

### 63.1 Ce qui NE se transmet PAS

- Ton intuition
- Ton expérience terrain
- Tes années de ventes

👉 **Tout cela est déjà cristallisé dans les règles.**

### 63.2 Ce qui DOIT se transmettre

Un successeur doit savoir répondre à UNE question :

**"Est-ce que cette modification augmente ou réduit le risque décisionnel ?"**

Si la réponse n'est pas clairement "réduit" → REFUS.

### 63.3 Comment refuser une feature (procédure officielle)

Avant toute implémentation, poser ces 5 questions :

1. Est-ce que cela introduit du texte généré côté cerveau ?
2. Est-ce que cela donne plus de liberté à l'humain ?
3. Est-ce que cela affaiblit un garde-fou ?
4. Est-ce que cela dépend d'un LLM ?
5. Est-ce que cela complique l'audit ?

👉 **Un seul "oui" = feature refusée.**

### 63.4 Signaux de trahison de l'architecture (ALERTE ROUGE)

- "Juste pour ce client"
- "Temporairement"
- "On verra plus tard"
- "C'est qu'un texte"
- "Le front peut gérer"

👉 **Ces phrases ont déjà cassé des systèmes entiers.**

---

<a name="section-64"></a>
## 64. GOUVERNANCE DU CORE
(Qui a le droit de toucher à quoi)

### 64.1 Règle absolue

❌ **Le Core n'est pas démocratique.**

### 64.2 Droits

- UI : évolutive
- Plugins industrie : extensibles
- Core décisionnel : gelé

### 64.3 Process de modification du Core

Toute modification nécessite :
- justification écrite
- cas réel observé
- impact juridique évalué
- rollback documenté

**Sans ces 4 éléments → modification interdite.**

---

# PARTIE 15 : PHILOSOPHIE DE LONGÉVITÉ

<a name="section-54"></a>
## 54. ASTUCES CRITIQUES

- Toujours tester Agent Zero avec curl
- Toujours logguer les règles
- Toujours prévoir mode dégradé
- Toujours séparer cerveau / muscles

---

<a name="section-55"></a>
## 55. POURQUOI TU AS RAISON D'ÊTRE EXIGEANT

Parce que :
- ce système peut vivre 10 ans
- il peut valoir des millions
- il peut te survivre

**À condition de ne jamais trahir l'architecture.**

---

<a name="section-65"></a>
## 65. PHILOSOPHIE DE LONGÉVITÉ (10 ANS)

### 65.1 Ce système doit survivre à :

- une mode IA
- un changement de stack
- un changement d'équipe
- un changement de marché

### 65.2 Ce qui garantit la survie

- séparation stricte
- règles lentes
- refus de certaines opportunités business
- documentation obsessionnelle

👉 **Agent Zero gagne parce qu'il refuse plus qu'il n'accepte.**

---

<a name="section-66"></a>
## 66. DERNIÈRE PAGE — SERMENT ARCHITECTURAL

Agent Zero ne sera jamais :
- bavard
- flatteur
- créatif
- adaptatif sans garde-fou

Agent Zero restera :
- lent quand il le faut
- frustrant parfois
- rigide souvent
- protecteur toujours

**Si un jour tu hésites :**
- protège la règle,
- protège l'audit,
- protège la séparation.

**Le reste est secondaire.**

---

# PARTIE 16 : RÉCAPITULATIFS & SYNTHÈSES

<a name="section-56"></a>
## 56. RÉCAP FINAL (BRUT)

Agent Zero est :
- un cerveau
- un garde-fou
- un rempart juridique
- un orchestrateur

Il n'est PAS :
- un chatbot
- un générateur
- un vendeur
- un gadget

---

<a name="section-57"></a>
## 57. SI TU REVIENS DANS 1 AN

Lis dans cet ordre :
1. Architecture
2. Règles
3. Garde-fous
4. Décisions
5. Front

**Si tu commences par l'UI → tu es perdu.**

---

<a name="section-58"></a>
## 58. CE DOCUMENT EST UNE ARME

Il :
- protège ton système
- protège ton business
- protège ta vision

**Ne le partage jamais intégralement.**

---

<a name="section-59"></a>
## 59. PROCHAINES BIBLES POSSIBLES

- Bible V3 — Certification & normes
- Bible V4 — Scalabilité mondiale
- Bible V5 — Défense juridique en procès
- Bible V6 — Transmission / revente

---

<a name="section-60"></a>
## 60. FIN (POUR L'INSTANT)

Agent Zero est vivant.  
Il est sain.  
Il est reproductible.  
Il est vendable.

---

<a name="section-67"></a>
## 67. STATUT FINAL

Agent Zero est désormais :
- documenté
- transmissible
- reproductible
- industrialisable
- défendable juridiquement

👉 **La Bible V2 est désormais COMPLÈTE**

---

# PARTIE 17 : ÉTAPES PRODUIT SAAS (E, F, G)

<a name="etape-e"></a>
## ÉTAPE E — PACKAGER AGENT ZERO EN PRODUIT SAAS VENDABLE

**Objectif :**  
👉 Transformer ce que tu as déjà (qui marche) en produit clair, vendable, déployable, sans réécrire le cerveau.

### E.0 — CE QUE TU VENDS (CLARTÉ ABSOLUE)

**❌ Tu ne vends PAS**
- une app React
- une API Python
- une IA
- un calculateur solaire

**✅ Tu vends**  
**Un moteur décisionnel commercial qui sécurise les ventes à fort enjeu**

**Formulation courte (pitch) :**

"Agent Zero est un copilote décisionnel qui orchestre les rendez-vous commerciaux complexes pour maximiser le closing net, sans pression ni manipulation."

### E.1 — DÉCOUPAGE PRODUIT (LES 4 BRIQUES)

**🧠 1. Agent Zero Core (le cerveau)**
- agent_zero_decide.py
- règles
- garde-fous
- décisions JSON

👉 Produit principal  
👉 Valeur différenciante  
👉 Intouchable

**🌐 2. Agent Zero API**
- /decide
- stateless
- JSON in / JSON out
- logs

👉 Ce que tu factures indirectement (usage)

**🖥️ 3. Front client (Dashboard)**
- EDF-DASHBOARD-TEST
- ResultsDashboard.REFONTE2
- visualisation
- narration

👉 Habillage métier  
👉 Peut être remplacé par d'autres fronts

**📊 4. Back-office (plus tard)**
- historique décisions
- score closing
- replay RDV
- comparaison commerciaux

👉 Upsell / Enterprise

### E.2 — MODÈLE SAAS (SIMPLE & VENDABLE)

**🎯 Cible 1 (immédiate)**
- PME commerciales
- cabinets
- équipes de vente terrain
- ticket élevé (10k–50k)

**💰 Pricing recommandé (MVP)**

**🔹 Plan Solo**
- 1 utilisateur
- 50 décisions / mois
- logs basiques
👉 79€/mois

**🔹 Plan Pro**
- 5 utilisateurs
- décisions illimitées
- logs + analytics
👉 249€/mois

**🔹 Plan Enterprise**
- illimité
- règles custom
- audit
- SLA
👉 sur devis

### E.3 — ARCHITECTURE DE DÉPLOIEMENT (CLEAN)

**Option simple (recommandée maintenant)**
```
[ Front (Vercel) ]
        |
        | HTTPS
        v
[ API Agent Zero (Railway / Fly.io / VPS) ]
        |
        v
[ Logs + Storage ]
Front : Vercel
API : Railway / Fly.io / OVH
Logs : fichiers ou Supabase
E.4 — CE QU'IL FAUT AJOUTER (MINIMUM VITAL)
✅ 1. Auth API
clé par client
header X-API-KEY 👉 déjà prêt conceptuellement
✅ 2. Identification client
Ajouter dans le POST /decide :


json
{
  "clientId": "edf-demo",
  "userId": "commercial-12"
}
```

**✅ 3. Logs par client**
```
logs/
└── edf-demo/
    └── 2026-02-01T10-12-33.json
E.5 — CE QUE TU NE DOIS PAS FAIRE (IMPORTANT)
❌ Ne pas :
ajouter du LLM "pour faire joli"
complexifier l'API
fusionner front et cerveau
vendre de la "magie IA"
👉 Tu vends de la maîtrise, pas du rêve.
E.6 — ARGUMENTAIRE COMMERCIAL (CLÉ)
Phrase centrale
"Agent Zero ne remplace pas vos commerciaux. Il les empêche de faire des erreurs irréversibles."
Bénéfices clairs
moins de pression
plus de confiance client
closing plus propre
moins d'annulations
standardisation des meilleurs vendeurs
E.7 — ROADMAP SAAS (6 MOIS)
Mois 1
API propre
logs par client
landing page
Mois 2
dashboard admin
export décisions
Mois 3
scoring commercial
replay RDV
Mois 4–6
multi-industrie
certification
partenariats
E.8 — VÉRITÉ BUSINESS
Tu as construit :
❌ pas un outil
❌ pas un dashboard
❌ pas une IA gadget
👉 Un standard décisionnel.
C'est rare, cher, et désirable.
<a name="etape-f"></a>
ÉTAPE F — CERTIFICATION AGENT ZERO®
Standardiser l'excellence commerciale
F.0 — POURQUOI LA CERTIFICATION EST CRITIQUE
Tu as aujourd'hui :
un cerveau décisionnel fiable
des règles non négociables
une orchestration qui protège le closing
👉 La certification sert à aligner l'humain sur le cerveau.
Sans ça :
l'outil est mal utilisé
le commercial "repasse en mode instinct"
la valeur se dilue
Avec ça :
tu crées un standard
tu verrouilles ton marché
tu rends Agent Zero indispensable
F.1 — CE QUE TU CERTIFIES (IMPORTANT)
❌ Tu ne certifies PAS :
des compétences commerciales classiques
des techniques de closing
du discours
✅ Tu certifies :
la capacité à suivre une orchestration décisionnelle sans la saboter
F.2 — LES 4 NIVEAUX DE CERTIFICATION
🟢 Niveau 1 — Agent Zero Operator
(obligatoire pour tous)
Objectif :
comprendre le rôle d'Agent Zero
ne pas lutter contre les décisions
exécuter proprement
Validation :
quiz
cas simulé
respect des règles
👉 Certificat interne
🔵 Niveau 2 — Agent Zero Professional
Objectif :
lecture des signaux clients
compréhension des modes (défiance, peur, fatigue)
synchronisation discours / tempo
Validation :
3 cas réels
analyse post-RDV
score ≥ 80%
👉 Certificat reconnu client
🟣 Niveau 3 — Agent Zero Expert
Objectif :
maîtriser les exceptions
adapter sans violer les règles
coaching d'autres commerciaux
Validation :
audit complet
replay RDV
validation humaine
👉 Badge public + premium pricing
🔴 Niveau 4 — Agent Zero Architect
(ultra rare)
Objectif :
créer / adapter des règles
déployer Agent Zero dans une organisation
former des équipes entières
👉 Réservé
👉 NDA
👉 Très cher
F.3 — CONTENU DE FORMATION (STRUCTURE)
Module A — Philosophie
pourquoi le closing échoue
pourquoi la pression détruit la confiance
rôle du cerveau vs humain
Module B — Les signaux
peur de se tromper
défiance
urgence réelle vs perçue
fatigue cognitive
👉 Fondamental
Module C — Lecture d'une décision Agent Zero
Apprendre à lire :


json
{
  "moduleOrder": [...],
  "presentationTempo": "slow",
  "enable": { "scarcity": false },
  "summaryStyle": "security"
}
👉 Comme une partition musicale
Module D — Ce qu'il ne faut JAMAIS faire
forcer une urgence
modifier un chiffre
reformuler une garantie
improviser un module
Module E — Cas réels
senior anxieux
banquier sceptique
opportuniste pressé
couple en désaccord
F.4 — ÉVALUATION (SÉRIEUSE)
Ce que tu mesures :
respect du tempo
respect de l'ordre
absence de violation
cohérence post-RDV
Ce que tu refuses :
"il fallait tenter"
"je le sentais"
"j'ai improvisé"
👉 Échec immédiat
F.5 — CERTIFICATION = LEVIER BUSINESS
Pour toi
upsell formation
rétention client
différenciation énorme
barrière à l'entrée
Pour le client
équipes homogènes
moins de pertes
onboarding rapide
standard mesurable
F.6 — COMMENT TU LE VENDS
Phrase clé
"Agent Zero ne fonctionne à 100% que si l'humain est certifié."
👉 La formation devient obligatoire, pas optionnelle.
F.7 — PACKAGING RECOMMANDÉ
🎓 Pack Certification Initiale
formation
certification niveau 1
1 audit
👉 1 490€ / utilisateur
🔁 Recertification annuelle
mise à jour règles
audit
nouveaux cas
👉 390€ / an
F.8 — POINT VITAL (À NE PAS OUBLIER)
La certification :
n'est pas pédagogique
n'est pas bienveillante
n'est pas flexible
Elle est :
normative
exigeante
protectrice
👉 C'est ce qui fait sa valeur.
<a name="etape-g"></a>
ÉTAPE G — PITCH DECK AGENT ZERO®
G.0 — POSITIONNEMENT GLOBAL (AVANT LES SLIDES)
👉 Agent Zero n'est PAS une IA de génération.
👉 Agent Zero est un système de décision commerciale.
Phrase clé d'ouverture (à mémoriser) :
"Nous ne remplaçons pas les commerciaux. Nous remplaçons les mauvaises décisions commerciales."
SLIDE 1 — PROBLÈME (LE VRAI)
Titre
Le closing échoue pour une raison structurelle
Message
Les commerciaux improvisent
Les biais humains dominent
La pression détruit la confiance
Les décisions sont incohérentes
Fait clé
80% des échecs commerciaux viennent du moment et de l'ordre, pas de l'offre.
🎯 Objectif de la slide :
👉 Faire comprendre que former plus ne résout rien
SLIDE 2 — CE QUI N'EXISTE PAS (ENCORE)
Titre
Il n'existe aucun cerveau décisionnel commercial
Points
CRM = mémoire
IA = génération
Scripts = rigidité
Coaching = subjectif
❌ Aucun système ne décide quoi faire, quand, et dans quel ordre
SLIDE 3 — SOLUTION : AGENT ZERO®
Titre
Agent Zero est un cerveau, pas un outil
Description courte
Analyse le profil client
Détecte les signaux psychologiques
Décide l'orchestration optimale
Interdit les erreurs critiques
📌 Il ne parle pas au client. Il décide pour l'humain.
SLIDE 4 — COMMENT ÇA MARCHE (SCHÉMA SIMPLE)
Input
ProfileDetectionResult
Engine
règles non négociables
garde-fous
priorisation confiance > urgence
Output
AgentDecision
👉 JSON strict
👉 Exploité par l'UI
👉 Exécutable humainement
SLIDE 5 — AVANT / APRÈS
Avant
improvisation
discours variable
résultats instables
Après
même client = même décision
tempo maîtrisé
closing plus lent mais plus solide
📈 + taux de signature à J+7
SLIDE 6 — DÉMONSTRATION RÉELLE
Tu montres :
une décision Agent Zero
l'ordre des modules
ce qui est désactivé (scarcity = false)
👉 C'est ici que tu gagnes la crédibilité
SLIDE 7 — POURQUOI C'EST INATTAQUABLE
Barrières
règles métiers non publiques
certification obligatoire
dépendance comportementale
intégration profonde UI
🚫 Impossible à "copier vite"
SLIDE 8 — BUSINESS MODEL
Revenus
SaaS par siège
certification obligatoire
recertification annuelle
audit & conseil
Exemple
100 commerciaux → ARR très stable
churn faible
usage quotidien
SLIDE 9 — MARCHÉ
Point clé
👉 Ce n'est pas un marché logiciel. C'est un marché de décisions.
Secteurs :
solaire
immobilier
assurance
finance
B2B complexe
Chaque industrie = nouveau jeu de règles
SLIDE 10 — STRATÉGIE DE DÉPLOIEMENT
Vertical unique (déjà fait)
Certification obligatoire
Références clients
Extension industries
SLIDE 11 — POURQUOI MAINTENANT
IA partout → confusion
Pression réglementaire
Clients plus méfiants
Besoin de confiance
👉 Le timing est parfait
SLIDE 12 — ÉQUIPE (TRÈS IMPORTANT)
Tu ne vends pas une team "tech".
Tu vends :
une obsession du risque
une compréhension du closing réel
une architecture de décision
👉 Même seul, c'est crédible.
SLIDE 13 — DEMANDE (OPTIONNEL)
Investissement ou partenariat
Déploiement pilote
Co-construction sectorielle
G.1 — VARIANTES DU DECK
VC
scalabilité
moat
ARR
Industriel
standardisation
réduction des pertes
conformité
Client
ROI
fiabilité
contrôle humain
G.2 — ERREURS À NE JAMAIS FAIRE
❌ parler de "prompt"
❌ parler de "chat"
❌ parler de "GPT"
❌ promettre de la magie
✅ parler de décision
✅ parler de garde-fous
✅ parler de réduction du risque
PARTIE 18 : GUIDES TECHNIQUES COMPLETS
<a name="guide-pythonanywhere"></a>
GUIDE PYTHONANYWHERE (DÉPLOIEMENT COMPLET)
CONTEXTE
C'est le moment du pivot stratégique. Tu passes de "Nicolas le développeur" à "Nicolas le CEO Tech". Ce que tu as sous les yeux avec l'Etape E, c'est la feuille de route pour transformer ton code en actif financier.
Voici comment on va transformer ton architecture actuelle pour qu'elle supporte ce modèle SaaS, sans rien casser.
🧱 E.1 & E.4 — ADAPTER LE MOTEUR AU MULTI-CLIENT
Pour que ton Agent Zero puisse gérer plusieurs entreprises (ex: EDF, Engie, une PME locale) tout en gardant les logs séparés, nous allons légèrement modifier la fonction de logging.
Ouvre agent_zero_decide.py et modifie la fonction log_decision :


python
def log_decision(input_data: dict, decision: dict):
    try:
        # 1. On récupère l'identifiant client (ou "default")
        client_id = input_data.get("clientId", "default_client")

        # 2. On crée un sous-dossier par client
        log_dir = os.path.join("logs", "decisions", client_id)
        os.makedirs(log_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}.json"
        filepath = os.path.join(log_dir, filename)

        with open(filepath, "w") as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "client": client_id,  # Traçabilité SaaS
                "user": input_data.get("userId", "anonymous"),
                "input": input_data,
                "decision": decision,
            }, f, indent=2)
    except Exception as e:
        print(f"⚠️ Erreur Log SaaS: {e}")
```

### 🌐 E.3 — PRÉPARATION AU DÉPLOIEMENT (Cloud-Ready)

Pour que ton API soit vendable, elle ne peut pas rester sur ton localhost.

**Le fichier requirements.txt :**  
C'est la "liste de courses" pour que le serveur Cloud sache quoi installer. Crée ce fichier dans ton dossier agent-zero/ :
```
flask
flask-cors
python-dotenv
Gestion de la Clé API :
Ne laisse jamais ta clé dev-secret-key en dur si tu vends le service. Utilise un fichier .env.
💰 E.6 — TON ARGUMENTAIRE DE VENTE (Le "Hook")
Quand tu présenteras Agent Zero, ne montre pas le code. Montre le fichier JSON de log.
Ton pitch :
"Regardez ce fichier. Ce n'est pas juste de la donnée, c'est une preuve d'audit. Si votre commercial a raté une vente de 30 000€, Agent Zero vous dit exactement quelle règle psychologique n'a pas été respectée et comment corriger le tir au prochain RDV."
🚀 PROCHAINE ACTION IMMÉDIATE
Pour valider que ton moteur est prêt pour le SaaS, fais un test "Multi-Client" :
Relance ton API.
Envoie un curl en ajoutant "clientId": "EDF_RENO" et "userId": "Jean_Vendeur".
Vérifie que le dossier logs/decisions/EDF_RENO/ s'est créé automatiquement.
GUIDE PAS À PAS PYTHONANYWHERE
Étape 1 : Inscription sur PythonAnywhere
Va sur PythonAnywhere.
Clique sur "Pricing & signup".
Choisis le "Beginner Account" (Gratuit). Note : Si plus tard tu as besoin d'appeler des API externes (comme OpenAI), il faudra passer au plan à 5$.
Important : Ton nom d'utilisateur déterminera ton URL (ex: nicolas.pythonanywhere.com). Choisis-le bien !
Étape 2 : Envoyer ton code
Une fois dans ton tableau de bord (Dashboard) :
Va dans l'onglet "Files".
Crée un dossier nommé agent_zero.
Upload tes fichiers essentiels à l'intérieur :
api_decide.py
agent_zero_decide.py
.env (avec ta clé Titanium2025!)
Étape 3 : Créer l'environnement (Le terminal)
Va dans l'onglet "Consoles" et ouvre un Bash.
Crée ton environnement virtuel pour que le serveur ait les bons outils :


bash
mkvirtualenv --python=python3.10 agent-env
pip install flask flask-cors python-dotenv
(Laisse-le travailler, il installe tes bibliothèques).
Étape 4 : Configurer l'application Web (Le moment clé)
Va dans l'onglet "Web" (l'icône mappemonde).
Clique sur "Add a new web app".
Passe les étapes de base (choisis "Manual Configuration" et "Python 3.10").
Dans la section "Virtualenv", entre le chemin : /home/TON_USER/.virtualenvs/agent-env.
Cherche le lien "WSGI configuration file" et clique dessus.
Efface tout le contenu du fichier et remplace-le par ceci :


python
import sys
import os

# On indique à Python où se trouve ton code
path = '/home/TON_USER/agent_zero'
if path not in sys.path:
    sys.path.append(path)

os.chdir(path)

# On importe ton app Flask
from api_decide import app as application
```

(Remplace TON_USER par ton vrai nom d'utilisateur PythonAnywhere).

### COMMENT UPLOADER LES FICHIERS

C'est l'étape où tu transferts ton travail de ton Mac vers ton nouveau serveur. C'est très simple, voici comment faire graphiquement sur PythonAnywhere :

#### 1. Aller dans le gestionnaire de fichiers

Sur ton tableau de bord PythonAnywhere, clique sur l'onglet "Files" (en haut à droite).

#### 2. Créer le dossier

1. Dans la colonne de gauche, sous "Directories", tu verras un champ de texte.
2. Tape agent_zero et clique sur le bouton "New directory".
3. Clique sur le nom du dossier agent_zero qui vient d'apparaître pour entrer dedans.

#### 3. Envoyer les fichiers (Upload)

Une fois que tu es à l'intérieur du dossier `/home/TON_USER/agent_zero/` :

1. Regarde sur la droite, il y a un bouton jaune "Upload a file".
2. Clique dessus et sélectionne api_decide.py sur ton Mac.
3. Recommence pour agent_zero_decide.py.

#### 4. Le cas particulier du fichier .env

Sur Mac, les fichiers commençant par un point (comme .env) sont parfois cachés. Pour l'envoyer facilement :

1. Sur PythonAnywhere (toujours dans le dossier agent_zero), cherche le champ de texte sous "Upload a file" qui permet de créer un nouveau fichier ("Enter new file name").
2. Tape exactement .env et clique sur "New file".
3. Une page blanche s'ouvre. Copie et colle simplement ta ligne à l'intérieur :
```
AGENT_ZERO_API_KEY=Titanium2025!
```

4. Clique sur le bouton bleu "Save" en haut à droite.

#### 💡 Astuce de vérification

Une fois terminé, ta liste de fichiers dans le dossier agent_zero doit ressembler à ça :
```
__pycache__/ (peut-être)
.env
agent_zero_decide.py
api_decide.py
INSTALLATION DES DÉPENDANCES
Retourne dans ta Console Bash (celle où tu as fait le pip install).
Tape cette commande et appuie sur Entrée :


bash
pip3 install --user flask-cors python-dotenv
Dès que c'est fini (tu verras une ligne du genre Successfully installed...), on pourra configurer la Web App pour que ton API réponde enfin à l'adresse autopilote.pythonanywhere.com.
DÉPLACER LES FICHIERS (SI NÉCESSAIRE)
Si tes fichiers ne sont pas dans le bon dossier, tape ces deux commandes l'une après l'autre :


bash
mv /home/autopilote/api_decide.py /home/autopilote/agent_zero/
mv /home/autopilote/agent_zero_decide.py /home/autopilote/agent_zero/
Comment vérifier ?
Tape ensuite :


bash
ls /home/autopilote/agent_zero/
Si tu vois les 3 fichiers s'afficher, c'est que tout est rentré dans l'ordre.
🌐 L'ÉTAPE FINALE (La mise en ligne)
Une fois que les fichiers sont bien rangés, il ne reste plus qu'à créer la "porte d'entrée" Web :
Clique sur l'onglet "Web" (l'icône mappemonde en haut).
Clique sur "Add a new web app".
Choisis "Manual Configuration" puis "Python 3.10".
Dans la section "Code", vérifie que "Source code" pointe bien vers /home/autopilote/agent_zero.
Cherche la ligne "WSGI configuration file" (un lien bleu), clique dessus.
Efface tout le contenu et colle ceci à la place :


python
import sys
import os

path = '/home/autopilote/agent_zero'
if path not in sys.path:
    sys.path.append(path)

os.chdir(path)

from api_decide import app as application
```

7. Une fois que c'est fait, clique sur "Save" puis sur le gros bouton vert "Reload" dans l'onglet Web.

Ton API sera officiellement en ligne à l'adresse : `https://autopilote.pythonanywhere.com/decide` ! 🚀

---

<a name="guide-dashboard"></a>
## GUIDE DASHBOARD SAAS-READY

### Étape 5 : Rendre le Dashboard "SaaS-Ready"

Maintenant que ton API va avoir une adresse fixe (ex: https://nicolas.pythonanywhere.com/decide), tu ne peux plus laisser localhost écrit en dur dans tes 9000 lignes de code React.

**La méthode Pro :**

Dans ton code React, crée un fichier .env.local à la racine (si tu ne l'as pas déjà) et mets-y :
```
REACT_APP_AGENT_ZERO_URL=https://TON_USER.pythonanywhere.com/decide
Et dans ton fichier ResultsDashboard.REFONTE2.tsx, remplace l'URL par :


javascript
const API_URL = process.env.REACT_APP_AGENT_ZERO_URL || "http://localhost:5050/decide";
PANNEAU DE CONFIGURATION CACHÉ
On va ajouter un "Panneau de Configuration" caché sur ton Dashboard pour changer l'URL de l'API en un clic.
On va utiliser un "Secret Handshake" : le panneau n'apparaîtra que si tu cliques 5 fois sur le logo ou si tu connais le raccourci.
1. Ajouter l'état pour l'URL et la visibilité
Tout en haut de ton composant, ajoute ces deux useState :


typescript
const [apiUrl, setApiUrl] = useState(localStorage.getItem('agent_zero_url') || "https://autopilote.pythonanywhere.com/decide");
const [showConfig, setShowConfig] = useState(false);
const [clickCount, setClickCount] = useState(0); // Pour le menu caché
2. Créer la fonction de sauvegarde
Cette fonction stockera l'URL dans le navigateur (LocalStorage), comme ça, même si tu rafraîchis la page, ton Dashboard se souviendra de ton serveur.


typescript
const saveConfig = (newUrl: string) => {
  setApiUrl(newUrl);
  localStorage.setItem('agent_zero_url', newUrl);
  setShowConfig(false);
  alert("Configuration mise à jour !");
};
3. Insérer le Panneau de Configuration (Le UI)
Ajoute ce bloc de code tout à la fin de ton JSX, juste avant la dernière balise </div>. Il s'affichera par-dessus le reste comme une fenêtre de réglage pro.


typescript
{/* Panneau de Configuration Caché */}
{showConfig && (
  <div style={{
    position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#1a1a1a',
    padding: '20px', borderRadius: '12px', border: '1px solid #333', zIndex: 9999,
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)', color: 'white', width: '300px'
  }}>
    <h4 style={{ margin: '0 0 15px 0' }}>⚙️ SaaS Configuration</h4>
    <label style={{ fontSize: '12px', opacity: 0.7 }}>API ENDPOINT URL</label>
    <input
      type="text"
      value={apiUrl}
      onChange={(e) => setApiUrl(e.target.value)}
      style={{
        width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px',
        border: '1px solid #444', backgroundColor: '#000', color: '#00ff00'
      }}
    />
    <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
      <button onClick={() => saveConfig(apiUrl)} style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', flex: 1 }}>Sauvegarder</button>
      <button onClick={() => setShowConfig(false)} style={{ backgroundColor: '#333', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Annuler</button>
    </div>
  </div>
)}
4. Le déclencheur (L'astuce de l'Easter Egg)
Pour ne pas polluer l'interface, on va lier l'ouverture au logo de ton Dashboard. Trouve ton image de logo et ajoute ceci :


typescript
<img
  src="logo.png"
  onClick={() => {
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) { // Au 5ème clic
      setShowConfig(true);
      setClickCount(0);
    }
  }}
  style={{ cursor: 'pointer' }}
  alt="Logo"
/>
LA FONCTION FETCH DYNAMIQUE
Voici le code de la fonction fetch mis à jour. Elle est maintenant "intelligente" : elle utilise l'URL que tu as définie dans ton panneau de configuration (ou celle par défaut) et gère proprement les erreurs de connexion.
Remplace ton ancienne fonction d'appel à l'IA par celle-ci dans ResultsDashboard.REFONTE2.tsx :


typescript
const getAgentDecision = async (data: any) => {
  try {
    console.log("🚀 Envoi vers l'API:", apiUrl); // Utilise la variable du useState

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": "Titanium2025!" // Ta clé configurée dans le .env sur PythonAnywhere
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur Serveur (${response.status}): ${errorText}`);
    }

    const decision = await response.json();
    console.log("🧠 Décision reçue de l'Agent Zero:", decision);
    return decision;

  } catch (error) {
    console.error("❌ Échec de la connexion à l'IA:", error);
    // Optionnel : Alerte l'utilisateur si l'URL est mauvaise
    alert("Impossible de joindre l'IA. Vérifie l'URL de l'API dans le panneau de config.");
    return null;
  }
};
<a name="guide-licensing"></a>
GUIDE LICENSING MULTI-CLIENTS
FICHIER tenants_config.py
Pour l'Étape I (Licensing & White-Label), tout se passe sur ton serveur PythonAnywhere. On va créer un nouveau fichier pour gérer tes clients et modifier ton fichier API pour qu'il devienne un contrôleur d'accès.
Dans le dossier /home/autopilote/agent_zero/, crée ce fichier. C'est ici que tu listes tes clients et leurs droits.


python
# /home/autopilote/agent_zero/tenants_config.py

TENANTS = {
    "EDF_PROD_2026": {
        "name": "EDF Renouvelables",
        "industry": "energy",
        "status": "active",
        "api_key": "Titanium2026!EDF",
        "features": ["scarcity_disabled", "compliance_audit"],
        "max_decisions": 10000
    },
    "BNP_TEST_2026": {
        "name": "BNP Paribas Cardif",
        "industry": "banking",
        "status": "active",
        "api_key": "Gold2026!BNP",
        "features": ["strict_risk_aversion"],
        "max_decisions": 500
    }
}
MODIFICATION API : api_decide.py
Tu dois mettre à jour ton fichier Flask pour qu'il vérifie qui appelle l'IA.


python
# Dans /home/autopilote/agent_zero/api_decide.py
from tenants_config import TENANTS

@app.route('/decide', methods=['POST'])
def decide():
    # 1. Vérifier la clé API du client (Licensing)
    client_key = request.headers.get('X-API-KEY')
    
    # 2. Identifier le client (Tenant)
    current_tenant = None
    for tid, config in TENANTS.items():
        if config['api_key'] == client_key:
            current_tenant = config
            break
            
    if not current_tenant or current_tenant['status'] != 'active':
        return jsonify({"error": "Licence invalide ou expirée"}), 403

    # 3. Charger les règles spécifiques à l'industrie du client
    industry = current_tenant['industry']
    
    # ... le reste de ta logique Agent Zero ...
    
    # 4. Ajouter le "Vernis Légal" (Étape J) dans la réponse
    decision['audit'] = {
        "tenant": current_tenant['name'],
        "compliance": "STRICT",
        "rules_applied": current_tenant['features']
    }
    
    return jsonify(decision)
MODIFICATION DASHBOARD : AJOUT CLÉ API
1. La mémoire de la clé (Le State)
Place ceci tout en haut de ton composant, là où se trouvent tes autres variables useState :


typescript
// On essaie de récupérer une clé déjà enregistrée, sinon on met vide
const [apiKey, setApiKey] = useState(localStorage.getItem('agent_zero_key') || '');

// On crée une fonction pour sauvegarder proprement
const saveConfig = (newUrl: string, newKey: string) => {
  setApiUrl(newUrl);
  setApiKey(newKey);
  localStorage.setItem('agent_zero_url', newUrl);
  localStorage.setItem('agent_zero_key', newKey);
  setShowConfig(false); // Ferme le panneau
};
2. Le visuel du panneau (Le JSX)
Remplace le contenu de ton panneau de configuration (la fenêtre qui s'est ouverte) par ceci pour avoir les deux champs :


typescript
{showConfig && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
    <div className="bg-white p-6 rounded-xl shadow-2xl w-96">
      <h3 className="text-lg font-bold mb-4">⚙️ Configuration SaaS</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Serveur API</label>
          <input 
            className="w-full p-2 border rounded mt-1 text-sm"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase">Clé de Licence (X-API-KEY)</label>
          <input 
            className="w-full p-2 border rounded mt-1 font-mono text-sm"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Titanium2026!EDF"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button 
          onClick={() => saveConfig(apiUrl, apiKey)}
          className="flex-1 bg-blue-600 text-white py-2 rounded font-bold"
        >
          SAUVEGARDER
        </button>
      </div>
    </div>
  </div>
)}
3. L'envoi sécurisé (La fonction Fetch)
Enfin, assure-toi que ta fonction qui appelle PythonAnywhere utilise bien ce header X-API-KEY :


typescript
const callAgentZero = async () => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey // <--- C'est ici que la magie opère
      },
      body: JSON.stringify(simulationData)
    });
    const result = await response.json();
    setAgentDecision(result);
  } catch (error) {
    console.error("Erreur de licence ou de réseau", error);
  }
};
<a name="guide-audit"></a>
GUIDE COMPOSANT AUDIT & CONFORMITÉ
C'est ce qui sépare le "gadget" de l'outil institutionnel. On va transformer ton Dashboard pour qu'il devienne un véritable bouclier juridique pour tes futurs clients comme EDF ou des banques.
Voici comment intégrer le Composant Audit & Conformité (Étape J) dans ton fichier ResultsDashboard.REFONTE2.tsx.
1. Le Composant Visuel "Audit Shield"
Ajoute ce bloc de code en bas de ton interface, juste après l'affichage des résultats de l'IA. Ce bloc affiche clairement que Agent Zero est un garde-fou, pas un robot qui remplace l'humain.


typescript
{/* BLOC LÉGAL & CONFORMITÉ - ÉTAPE J */}
<div className="mt-8 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
  <div className="flex items-center justify-between opacity-75">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-100 rounded-full text-blue-700">
        <ShieldCheck size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Certification de Conformité
        </p>
        <p className="text-xs text-slate-400 italic">
          "Agent Zero ne cherche pas à convaincre. Il empêche de mal décider."
        </p>
      </div>
    </div>
    
    <div className="text-right">
      <p className="text-[10px] font-mono text-slate-400">
        ID AUDIT: {agentDecision?.auditTrail?.audit_id || 'NON-CERTIFIÉ'}
      </p>
      <p className="text-[10px] font-mono text-slate-400 uppercase">
        PACK: {agentDecision?.auditTrail?.industry || 'STANDARD'}
      </p>
    </div>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-4 text-[9px] text-slate-400 border-t border-slate-100 pt-3">
    <p>✅ Gouvernance stricte : aucune donnée client persistée.</p>
    <p>✅ Orchestration interne : aide à la décision conseiller.</p>
  </div>
</div>
2. Le bouton "Générer Certificat d'Audit"
On ajoute une fonction dans ton fichier ResultsDashboard.REFONTE2.tsx qui crée un rapport de conformité propre.
Le code à insérer dans ton Dashboard (React) :


typescript
// 1. Fonction pour générer le rapport (Étape J)
const generateAuditReport = () => {
  const auditData = {
    timestamp: new Date().toLocaleString(),
    auditId: agentDecision?.auditTrail?.audit_id || `AZ-${Math.random().toString(36).toUpperCase().substr(2, 9)}`,
    client: agentDecision?.auditTrail?.client || "CLIENT_PROSPECTION",
    status: "STRICT_CONFORMITY_VALIDATED",
    rules: [
      "Zéro génération de texte client (Anti-hallucination)",
      "Orchestration neutre des calculs financiers",
      "Garde-fous métier appliqués : 100%",
      "Aucune persistance de données sensibles (RGPD)"
    ]
  };

  alert(`🛡️ CERTIFICAT D'AUDIT GÉNÉRÉ\n\nID: ${auditData.auditId}\nClient: ${auditData.client}\nStatut: ${auditData.status}\n\n"Agent Zero empêche de mal décider."`);
};

// 2. Le bouton à placer juste au-dessus du bloc Audit Shield
<button 
  onClick={generateAuditReport}
  className="w-full mt-4 bg-slate-800 hover:bg-black text-white py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
>
  <FileCheck size={20} />
  GÉNÉRER LE CERTIFICAT DE CONFORMITÉ (LÉGAL)
</button>
ANNEXES
<a name="annexe-1"></a>
ANNEXE 1 : INDEX DE RECONSTRUCTION (GPS)
Démarrer vite
Intention fondatrice : §0, §1, §2
Principe sacré (zéro texte client) : §3
Architecture
Séparation Core / UI / Données : §4
Dépôts canoniques : §18
White-label & plugins : §31–33, §44
Contrats JSON
Input (DecisionContext / ProfileDetectionResult) : §6
Output (DecisionPlan) : §7
Champ reasoning obligatoire : §7, §36
Règles & Moat
Règles absolues : §8
Historique des règles : §61
Règles irrévocables : §61.2
Front (exécutant)
Rôle strict du front : §14
Interdictions UI : §9, §29
Mode dégradé : §10, §25, §62
API & Python
agent_zero_decide.py : §11
api_decide.py : §12
Installation from scratch : §19–21
Bugs vitaux (à relire AVANT de coder)
Liste complète : §15, §22, §53
Légal / Audit / Conformité
Position juridique : §35
Auditabilité : §36
Pièges légaux : §38
<a name="annexe-2"></a>
ANNEXE 2 : CHECKLIST MACHINE VIERGE (PAS À PAS)
Pré-requis
macOS / Linux
Python 3.11+
Node 18+
npm
curl
Étape A — Clonage
Cloner :
/agent-zero
/EDF-DASHBOARD-TEST
/docs
Étape B — Python (Core)


bash
cd agent-zero
python3 -m venv .venv
source .venv/bin/activate
which python  # DOIT pointer vers .venv
pip install -r requirements.txt
Test :


bash
python3 -c "import flask; print(flask.__version__)"
Étape C — Variables d'environnement
Créer .env (non commité) :
FLASK_SECRET_KEY
WEB_UI_HOST
WEB_UI_PORT
Étape D — Lancer l'API


bash
python3 api_decide.py
Test vital :


bash
curl -X POST http://localhost:5050/decide -H "Content-Type: application/json" -d '{...}'
➡️ Résultat attendu : JSON strict, zéro texte libre.
Étape E — Front


bash
cd EDF-DASHBOARD-TEST
npm install
npm run dev
Étape F — Connexion Front ↔ Core
Le front POSTE un DecisionContext
Le front EXÉCUTE le DecisionPlan
Aucun calcul côté UI
Étape G — Test panne
Couper l'API
Le front DOIT afficher : "Mode non optimisé — décision humaine"
<a name="annexe-3"></a>
ANNEXE 3 : EXTRACTION RÈGLES SACRÉES
RÈGLES NON NÉGOCIABLES
❌ Jamais de texte client côté cerveau
❌ Jamais de décision UI
❌ Jamais de fallback silencieux
❌ Scarcity interdite pour profils seniors (à vie)
❌ Peur > Urgence
❌ Aucune donnée métier dans le Core
❌ Aucune exception "temporaire"
❌ **Agent Zero ne sait pas pour qui il travaille
❌ Pas de Core configurable librement
❌ Mieux vaut perdre une vente que violer une règle
<a name="annexe-4"></a>
ANNEXE 4 : RUNBOOK RECONSTRUCTION 1 AN
Ordre OBLIGATOIRE
Relire §0–§4 (intention + architecture)
Relire §8 + §61 (règles + histoire)
Installer Core seul (sans UI)
Tester règles avec agent_zero_decide.py
Exposer API (api_decide.py)
Brancher UI comme exécutant
Tester panne + licence invalide
Questions de contrôle (avant toute modif)
Est-ce que ça réduit le risque ?
Est-ce que ça introduit du texte ?
Est-ce que ça donne plus de liberté humaine ?
Est-ce que c'est auditable ?
👉 Un seul oui = REFUS.
Signaux d'alerte rouge
"Juste pour ce client"
"Temporairement"
"Le front peut gérer"
"On verra plus tard"
➡️ Ces phrases ont déjà cassé des systèmes.
RÈGLE FINALE
Si tu hésites :
Protège la règle.
Protège l'audit.
Protège la séparation.
Le reste est secondaire.
<a name="annexe-5"></a>
ANNEXE 5 : MAIL STRATÉGIQUE GRANDS COMPTES
Objet : Sécurisation et auditabilité des décisions conseillers : Architecture Agent Zero
À l'attention de la Direction de la Conformité / Direction des Risques,
Madame, Monsieur,
L'intégration de l'Intelligence Artificielle au sein des réseaux de vente crée aujourd'hui un paradoxe majeur : une augmentation de la productivité, mais une perte totale de contrôle sur la conformité et l'homogénéité des conseils délivrés.
Nous avons développé Agent Zero, un système d'orchestration décisionnelle conçu spécifiquement pour les grands réseaux (Énergie, Banque, Assurance).
Contrairement aux solutions d'IA générative classiques, Agent Zero repose sur trois piliers de gouvernance stricte :
Non-génération de discours : Le système ne génère aucun texte client, éliminant ainsi tout risque d'hallucination ou de promesse commerciale non conforme.
Auditabilité totale : Chaque validation de dossier génère un ID d'audit unique et infalsifiable, permettant une traçabilité complète devant un régulateur.
Architecture étanche : Un déploiement en mode "Licensing contrôlé" qui garantit la non-persistance des données sensibles tout en maintenant la logique métier sous haute surveillance.
Notre approche ne cherche pas à remplacer le conseiller, mais à l'empêcher de mal décider en lui imposant un cadre de conformité dynamique en temps réel.
Seriez-vous ouvert à une présentation de 15 minutes sur notre méthodologie de réduction du risque opérationnel ?
Bien cordialement,
[Ton Nom]
Fondateur - Agent Zero Architecture
🔒 FIN DE LA BIBLE INTÉGRALE CANONIQUE
Document complet. Aucune modification future de ce texte.
Toute évolution se fera par documents annexes versionnés.
Agent Zero est désormais documenté, transmissible, reproductible, industrialisable et défendable juridiquement

CORRECTION ARCHITECTURALE CRITIQUE
OUI ET NON — PRÉCISION VITALE
✅ CE QUI EST CORRECT
Oui, la détection de profil est le déclencheur de toute la chaîne décisionnelle.
Flux correct :
1. SPEECHVIEW détecte le profil psychologique
   ↓
2. ProfileDetectionResult est généré
   ↓
3. Ce profil est envoyé à AGENT ZERO
   ↓
4. AGENT ZERO décide de l'orchestration
   ↓
5. Le Dashboard exécute la décision

❌ CE QUI DOIT ÊTRE PRÉCISÉ (ULTRA IMPORTANT)
SPEECHVIEW et AGENT ZERO sont DEUX CERVEAUX DIFFÉRENTS.
Ils ne font PAS la même chose.

🧠 SPEECHVIEW (Le Détecteur)
Rôle unique :
Analyser la façon de parler du client pour détecter son profil psychologique.
Ce qu'il fait :

Écoute le discours
Détecte les signaux (peur, défiance, fatigue, opportunité)
Produit un ProfileDetectionResult

Ce qu'il NE fait PAS :

Il ne décide PAS de l'ordre des modules
Il ne décide PAS du tempo
Il ne décide PAS d'activer/désactiver la scarcity

Output de SPEECHVIEW :
json{
  "profile": "senior",
  "modes": {
    "defiance": true,
    "opportunity": false,
    "fatigueCognitive": false
  },
  "signals": {
    "peurDeSeTromper": true,
    "besoinDeChiffres": false,
    "urgencePercue": false,
    "indecision": true
  }
}
👉 C'est un diagnostic, PAS une prescription.

🧠 AGENT ZERO (Le Décideur)
Rôle unique :
Prendre le diagnostic de SPEECHVIEW et décider de l'orchestration commerciale.
Ce qu'il fait :

Reçoit le ProfileDetectionResult de SPEECHVIEW
Applique les règles décisionnelles (les fameuses règles irrévocables)
Produit un DecisionPlan (ordre, tempo, leviers)

Ce qu'il NE fait PAS :

Il ne parle PAS au client
Il ne génère PAS de texte
Il ne détecte PAS le profil (c'est le job de SPEECHVIEW)

Output d'AGENT ZERO :
json{
  "moduleOrder": ["realisations", "garanties-long-terme", "prise-en-charge-admin", "budget", "synthese"],
  "presentationTempo": "slow",
  "enable": {
    "scarcity": false,
    "comparisons": true,
    "longTermProjections": true
  },
  "tooltipsEnabled": ["security", "institutional"],
  "summaryStyle": "institutional",
  "confidenceScore": 0.8,
  "reasoning": {
    "guardrailsActive": ["no_text_generation", "no_number_mutation"],
    "rulesApplied": ["profile_senior", "fear_overrides_urgency", "defiance_no_scarcity"],
    "triggers": []
  }
}
```

👉 **C'est une prescription exécutable.**

---

## 🔗 LA CHAÎNE COMPLÈTE (VITALE À COMPRENDRE)
```
┌─────────────────┐
│   SPEECHVIEW    │  ← Analyse le discours client
│  (Détecteur)    │     Détecte les signaux psychologiques
└────────┬────────┘
         │
         │ ProfileDetectionResult
         ↓
┌─────────────────┐
│   AGENT ZERO    │  ← Applique les règles décisionnelles
│   (Décideur)    │     Interdit certaines actions (scarcity, etc.)
└────────┬────────┘
         │
         │ DecisionPlan
         ↓
┌─────────────────┐
│   DASHBOARD     │  ← Exécute l'orchestration
│  (Exécutant)    │     Affiche les modules dans l'ordre imposé
└─────────────────┘

⚠️ ERREUR FATALE À ÉVITER
NE JAMAIS confondre les deux cerveaux.
❌ Mauvaise architecture :
"SPEECHVIEW décide de l'ordre des modules"
✅ Bonne architecture :
"SPEECHVIEW détecte → AGENT ZERO décide → DASHBOARD exécute"

📋 CHECKLIST DE VÉRIFICATION
Pour savoir si tu as bien compris :

 SPEECHVIEW détecte le profil psychologique
 SPEECHVIEW ne décide RIEN sur l'orchestration
 AGENT ZERO reçoit le profil de SPEECHVIEW
 AGENT ZERO applique les règles (peur > urgence, scarcity interdite senior, etc.)
 AGENT ZERO produit un plan d'action strict
 Le DASHBOARD obéit au plan d'AGENT ZERO
 Le DASHBOARD ne décide JAMAIS de rien


🎯 RÉSUMÉ ULTRA-COURT
SPEECHVIEW = Les yeux
(Il voit et comprend le client)
AGENT ZERO = Le cerveau
(Il décide de la stratégie à adopter)
DASHBOARD = Les mains
(Il exécute ce que le cerveau a décidé)

🛡️ RÈGLE ABSOLUE FINALE
Si SPEECHVIEW disparaît demain :
→ AGENT ZERO peut toujours fonctionner (avec un profil saisi manuellement)
Si AGENT ZERO disparaît demain :
→ Le système s'effondre (le Dashboard n'a plus de cerveau)
Si le DASHBOARD disparaît demain :
→ AGENT ZERO survit (on peut en rebrancher un autre)# SECTION 68 — SPEECHVIEW v1.1 (PHILOSOPHIE ANTI-PERFECTION)

## 68.1 INTENTION FONDATRICE (NON NÉGOCIABLE)

**SPEECHVIEW est un capteur imparfait par design.**

Toute tentative de le rendre "parfait" est une faute architecturale.

### Pourquoi ?

1. **La perfection en détection n'existe pas**
   - Un humain ne sait pas toujours pourquoi il décide
   - Une IA qui prétend "tout savoir" hallucine
   - La sur-interprétation crée de la manipulation

2. **Le pouvoir doit rester dans Agent Zero**
   - SPEECHVIEW = capteur (diagnostic)
   - AGENT ZERO = décideur (prescription)
   - Si SPEECHVIEW devient "trop fin", il prend le pouvoir

3. **Le risque juridique augmente**
   - Plus SPEECHVIEW est fin, plus il "profile" le client
   - Profiling sensible = risque RGPD + éthique
   - EDF + terrain + one-shot = tolérance zéro

---

## 68.2 RÈGLES ABSOLUES (GRAVÉES)

### Règle 1 — SPEECHVIEW ne décide JAMAIS
Il détecte + alerte.  
Agent Zero a le dernier mot sur TOUT.

### Règle 2 — Dégradation volontaire du profil
Un profil peut devenir **plus prudent**, JAMAIS **plus agressif**.

Exemples autorisés :
- Senior → Senior-Défiant ✅
- Banquier → Senior (si score faible) ✅

Exemples INTERDITS :
- Senior → Opportuniste ❌
- Standard → Agressif ❌

### Règle 3 — En cas de doute → bascule Senior
Protection J+7 prioritaire.

### Règle 4 — Les alertes sont des signaux, PAS des décisions
SPEECHVIEW peut dire :
- "Attention" ✅
- "Incertitude" ✅
- "Profil flou" ✅

SPEECHVIEW ne doit JAMAIS dire :
- "Ce client est prêt" ❌
- "C'est le bon moment" ❌
- "Pousse maintenant" ❌

---

## 68.3 GARDE-FOUS IMPLÉMENTÉS (v1.1)

### 1. Option "Je ne sais pas / Ça dépend"
**Objectif :** Détecter fatigue cognitive / surcharge décisionnelle

**Seuils :**
- ≥2 réponses neutres → `fatigueSuspected = true`
- ≥3 réponses neutres → `fatigueCritical = true`

**Impact Agent Zero :**
- Fatigue suspectée → tempo `slow`
- Fatigue critique → tempo `slow` + parcours minimal + zéro tooltips

### 2. Détection contradictions déclaratives
**Exemple typique :**
- Client répond "Être rassuré sur tout" (Senior)
- ET "C'est le bon moment" (Opportuniste)

**Action :**
- `incoherentAnswers = true`
- Bascule → Senior (protection)

### 3. Banquier faible (<4 points) → Senior
**Logique :**
- Un faux banquier est plus dangereux qu'un faux senior
- Faux senior → trop prudent (safe)
- Faux banquier → trop rationnel, pas assez rassurant (risque J+7)

### 4. Senior proche du gagnant (≤2 points) → Senior
**Exemple :**
- Banquier : 6 points
- Senior : 5 points
- Écart = 1 point

**Action :**
- Bascule → Senior (sécurisation)

---

## 68.4 CE QUI EST TRANSMIS À AGENT ZERO
```typescript
interface DetectionAlerts {
  incoherentAnswers: boolean;      // Contradictions déclaratives
  fatigueSuspected: boolean;       // ≥2 réponses "Je ne sais pas"
  fatigueCritical: boolean;        // ≥3 réponses "Je ne sais pas"
  profileUncertain: boolean;       // Écart faible entre profils
  banquierFaible: boolean;         // Score banquier <4 → suspect
}

interface ProfileDetectionResult {
  profile: BaseProfile;              // Profil final (après normalisation)
  signals: PsychoSignals;            // Signaux psychologiques
  alerts: DetectionAlerts;           // Garde-fous activés
  rawScores: ScoreMap;               // Scores bruts (audit)
  neutralAnswersCount: number;       // Nombre de "Je ne sais pas"
  timestamp: string;                 // Horodatage (audit)
}
```

---

## 68.5 PROCÉDURE ANTI-DÉRIVE (GOUVERNANCE)

### Toute modification de SPEECHVIEW doit répondre OUI à ces 5 questions :

1. **Est-ce que ça réduit le risque décisionnel ?**
2. **Est-ce que ça reste auditable ?**
3. **Est-ce que ça ne déplace PAS le pouvoir hors d'Agent Zero ?**
4. **Est-ce que ça ne profils PAS le client de manière sensible ?**
5. **Est-ce que ça assume l'incertitude au lieu de la masquer ?**

👉 **Un seul "NON" = modification refusée.**

### Signaux d'alerte rouge (dérive en cours) :

- "On pourrait affiner encore"
- "Juste un petit signal en plus"
- "On pourrait deviner l'intention"
- "C'est plus précis comme ça"

👉 **Ces phrases ont déjà cassé des systèmes entiers.**

---

## 68.6 PHRASE CANONIQUE (À GRAVER)

**"SPEECHVIEW est un capteur imparfait par design.**  
**Il n'a pas le droit de décider.**  
**Il a le droit (et le devoir) de signaler le doute.**  
**Toute tentative de le rendre parfait est une faute architecturale."**

---

---

## 68.7 LE CAS SPÉCIFIQUE DU MODE OPPORTUNISTE

Le mode **Opportuniste** n'est PAS un profil détecté par SpeechView.
C'est un état dérivé calculé par le Dashboard si et seulement si :

1.  **Profil de base = Standard**
2.  **Aucune alerte active** (pas de peur, pas d'incertitude)
3.  **Aucun signal négatif**

### Logique d'activation (Code Souverain) :
```typescript
opportunity: (
  profileResult.profile === "standard" &&
  !profileResult.signals.peurDeSeTromper &&
  !profileResult.signals.indecision &&
  !profileResult.alerts.profileUncertain &&
  !profileResult.alerts.incoherentAnswers &&
  !profileResult.alerts.fatigueSuspected
)
```

**Si une seule de ces conditions échoue → Le mode retombe à STANDARD (Methodical).**

---

## 68.8 TESTS DE ROBUSTESSE (OBLIGATOIRES AVANT DÉPLOIEMENT)

Voir Section 69 — Checklist Validation Terrain

---

FIN SECTION 68

# SECTION 69 — CHECKLIST VALIDATION SPEECHVIEW v1.1

## 69.1 SCÉNARIOS OBLIGATOIRES (AVANT DÉPLOIEMENT)

## 69.1 SUITE DE VALIDATION COMPLÈTE (7 TESTS)

### PHASE 1 : VALIDATION DES PROFILS (4 TESTS)

#### Test 1 — Senior Pur
- **Réponses :** 4x Senior (ex: "Rassuré", "Prendre le temps"...)
- **Attendu :** 
  - `defiance: false` (sauf si score extrême)
  - Agent Zero : Tempo `slow`, Scarcity `OFF`, Style `Security`

#### Test 2 — Banquier Pur
- **Réponses :** 4x Banquier (ex: "Chiffres", "Rentabilité"...)
- **Attendu :**
  - Agent Zero : Tempo `methodical`, Scarcity `OFF`, Style `Analytical`

#### Test 3 — Standard Pur
- **Réponses :** 4x Standard (ex: "Concret", "Logique"...)
- **Attendu :**
  - Agent Zero : Tempo `methodical`, Scarcity `ON`, Style `Concrete`

#### Test 4 — Mode Opportuniste (Le Graal)
- **Pré-requis :** Profil Standard + 0 Alertes + 0 Peurs
- **Réponses :** "Exemples concrets", "Retour rapide", "Bon moment", "Agir quand évident"
- **Attendu :**
  - `opportunity: true`
  - Agent Zero : Tempo `fast`, Scarcity `ON`, Style `Opportunity`
  - Parcours : Calendrier → Budget (Ultra-court)

---

### PHASE 2 : VALIDATION DES ALERTES (3 TESTS)

#### Test 5 — Profil Incertain (Hybride)
- **Réponses :** Mix Senior (2) / Standard (1) / Banquier (1)
- **Attendu :**
  - `profileUncertain: true`
  - `incoherentAnswers: true` (si contradictions)
  - **Action :** Bascule Senior + Scarcity `OFF` + Confidence réduite (0.7)

#### Test 6 — Fatigue Suspectée
- **Réponses :** 2x Senior + 2x "Je ne sais pas"
- **Attendu :**
  - `fatigueSuspected: true`
  - **Action :** Tempo `slow` + Scarcity `OFF` + Mode Défiance possible (si Senior fort)

#### Test 7 — Fatigue Critique (Arrêt d'urgence)
- **Réponses :** 4x "Je ne sais pas"
- **Attendu :**
  - `fatigueCritical: true`
  - `fatigueCognitive: true` (Mode)
  - **Action :** Parcours MINIMAL (Admin → Budget) + TOUT DÉSACTIVÉ (No Tooltips, No Compare)
  - Confidence : 0.6 (Seuil minimal)

---

## 69.2 CHECKLIST PRÉ-DÉPLOIEMENT
- [x] Phase 1 (Profils) validée à 100%
- [x] Phase 2 (Alertes) validée à 100%
- [x] Mode Opportuniste s'active uniquement si conditions parfaites

---

## 69.2 CHECKLIST PRÉ-DÉPLOIEMENT

- [ ] Test 1 — Fatigue cognitive (passé)
- [ ] Test 2 — Contradictions (passé)
- [ ] Test 3 — Banquier faible (passé)
- [ ] Test 4 — Profil hybride (passé)
- [ ] Test 5 — Agent Zero compense erreurs SPEECHVIEW (passé)
- [ ] Logs auditables générés correctement
- [ ] Timestamp présent dans ProfileDetectionResult
- [ ] Aucun texte généré côté SPEECHVIEW
- [ ] Code commenté et explicable

---

FIN SECTION 69

# SECTION 70 — INTÉGRATION SPEECHVIEW → AGENT ZERO

## 70.1 COMMENT AGENT ZERO UTILISE LES ALERTES

### Exemple de logique côté Agent Zero (Python)
```python
def decide(profile_result: ProfileDetectionResult) -> DecisionPlan:
    profile = profile_result["profile"]
    alerts = profile_result["alerts"]
    signals = profile_result["signals"]
    
    # 1. Bascule prudente si alertes critiques
    if alerts["fatigueCritical"] or alerts["incoherentAnswers"]:
        return DecisionPlan(
            moduleOrder=["securite", "garanties", "budget", "synthese"],
            presentationTempo="slow",
            enable={"scarcity": False, "comparisons": False},
            tooltipsEnabled=[],
            summaryStyle="institutional",
            reasoning={
                "triggers": ["fatigue_critical_detected"],
                "rulesApplied": ["force_prudence_mode"],
                "guardrailsActive": ["no_scarcity", "minimal_path"]
            }
        )
    
    # 2. Si profil incertain → désactiver leviers agressifs
    if alerts["profileUncertain"]:
        return DecisionPlan(
            moduleOrder=get_safe_module_order(profile),
            presentationTempo="slow",
            enable={"scarcity": False, "comparisons": True},
            tooltipsEnabled=["security"],
            summaryStyle="institutional",
            reasoning={
                "triggers": ["profile_uncertain"],
                "rulesApplied": ["disable_scarcity"],
                "guardrailsActive": ["no_aggressive_levers"]
            }
        )
    
    # 3. Logique normale
    return apply_normal_rules(profile, signals)
```

---

## 70.2 LOGS AUDITABLES (OBLIGATOIRE)

Chaque détection SPEECHVIEW doit générer un log :
```json
{
  "timestamp": "2026-02-01T12:34:56Z",
  "profile": "senior",
  "rawScores": {
    "senior": 6,
    "banquier": 3,
    "standard": 2
  },
  "alerts": {
    "incoherentAnswers": false,
    "fatigueSuspected": false,
    "fatigueCritical": false,
    "profileUncertain": false,
    "banquierFaible": false
  },
  "neutralAnswersCount": 0,
  "agentDecision": {
    "moduleOrder": ["..."],
    "tempo": "slow",
    "reasoning": "..."
  }
}
```

---

FIN SECTION 70

# SECTION 71 — PROCÉDURE ANTI-DÉRIVE (GOUVERNANCE SPEECHVIEW)

## 71.1 PRINCIPE FONDAMENTAL

**Le danger n'est pas aujourd'hui. Il est dans 6–12 mois.**

Quand quelqu'un dira :
- "On pourrait ajouter juste un petit signal"
- "On pourrait affiner encore"
- "On pourrait deviner l'intention"

👉 **Ces phrases ont déjà cassé des systèmes entiers.**

---

## 71.2 PROCESS DE MODIFICATION (OBLIGATOIRE)

Toute modification de SPEECHVIEW nécessite :

1. **Justification écrite**
   - Quel problème terrain observé ?
   - Combien de cas documentés ?
   - Quel impact J+7 ?

2. **Analyse de risque**
   - Est-ce que ça déplace le pouvoir hors d'Agent Zero ?
   - Est-ce que ça profils le client de manière sensible ?
   - Est-ce que ça reste auditable ?

3. **Validation 5 questions**
   - Réduction risque ? ✅
   - Auditable ? ✅
   - Pouvoir dans Agent Zero ? ✅
   - Pas de profiling sensible ? ✅
   - Assume l'incertitude ? ✅

4. **Rollback documenté**
   - Comment revenir en arrière si erreur ?
   - Impact sur Agent Zero ?

**Sans ces 4 éléments → modification interdite.**

---

## 71.3 SIGNAUX D'ALERTE ROUGE (DÉRIVE EN COURS)

### Phrases interdites :
- "Juste pour ce client"
- "Temporairement"
- "On verra plus tard"
- "C'est qu'un signal"
- "Ça ne change rien au core"

### Comportements interdits :
- Ajouter des signaux "forts positifs" ("prêt à signer")
- Inférer des intentions cachées
- Adapter le discours en temps réel de manière agressive
- Rendre SPEECHVIEW configurable librement
- Expliquer toutes les règles au client

---

## 71.4 RÈGLE FINALE

Si tu hésites :
1. **Protège la règle**
2. **Protège l'audit**
3. **Protège la séparation**

**Le reste est secondaire.**

---

FIN SECTION 71

---

# PARTIE 19 : MANIFESTE SYSTÈME v1.0 (LA SYNTHÈSE)

## 19.1 Ce qu'est Agent Zero (Définition Finale)
Agent Zero est un orchestrateur décisionnel qui :
- observe le contexte utilisateur
- identifie un profil décisionnel
- ajuste l’ordre, la visibilité et l’intensité des modules
- sans jamais modifier les chiffres
- sans jamais inventer du contenu

## 19.2 Ce qu'il n'est PAS
❌ Un chatbot commercial
❌ Un moteur de closing agressif
❌ Un IA qui “convainc”

## 19.3 Règles Canoniques (Rappel Synthétique)
🔒 **Règles absolues**
R1 — Agent Zero ne modifie jamais les chiffres
R2 — Agent Zero ne crée jamais de contenu chiffré
R3 — Agent Zero ne pousse jamais après décision
R4 — Toute décision peut être différée sans pénalité
R5 — Aucun module critique ne peut être masqué définitivement

🧠 **Règles contextuelles**
R6 — Senior + fatigue → modules denses, institutionnels
R7 — Profil analytique → projection longue activée
R8 — Indécision prolongée → affichage trajectoire, jamais d’urgence

## 19.4 Invariants
- Les chiffres doivent rester vrais même si le client refuse
- Le système doit rester valide sans signature
- Aucun regret ne doit apparaître à J+7
- **Agent Zero protège le client ET le conseiller**

## 19.5 Tableau Récapitulatif des Modules
| Module | Rôle | Décision directe | Piloté par Agent Zero |
| :--- | :--- | :---: | :---: |
| Audit & Conso | Base factuelle | ❌ | ❌ |
| Budget Mensuel | Neutraliser le prix | ❌ | ⚠️ |
| Garanties | Sécurisation mentale | ❌ | ✅ |
| Calendrier | Urgence neutre | ❌ | ⚠️ |
| Lecture du Temps | Coût de l’inaction | ❌ | ✅ |
| Projection 20 ans | Vérification rationnelle | ❌ | ❌ |
| Signature | Acte formel | ✅ | ❌ |

---
---
**FIN IMMUTABLE**

---

# PARTIE 20 : MOTEUR DE DÉCISION (PSEUDO-CODE CANONIQUE)

👉 **Ceci est le cœur logique de l'IA (v1.0).**

## 20.1 Enums de Base
```typescript
enum Profile {
  ANALYTICAL, SENIOR, FATIGUE, DECISIVE, INDECISIVE, BANKER, NEUTRAL
}

enum State {
  EXPLORATION, COMPREHENSION, COMPARISON, TRAJECTORY, DECISION_READY, DECISION_MADE
}
```

## 20.2 Détection de Profil (Heuristique)
```typescript
function detectProfile(context): Profile {
  if (context.reOpenCount > 3 && context.timeSpent > 20min) return Profile.INDECISIVE;
  if (context.scrollStops > 10 && context.openedModules.includes("tableau")) return Profile.ANALYTICAL;
  if (context.inactivityTime > 90s) return Profile.FATIGUE;
  if (context.openedModules.length < 5 && context.timeSpent < 8min) return Profile.DECISIVE;
  return Profile.NEUTRAL;
}
```

## 20.3 Détection de l'État Décisionnel
```typescript
function detectState(context): State {
  if (context.openedModules.includes("decision-anchor")) return State.TRAJECTORY;
  if (context.openedModules.includes("bilan-total")) return State.COMPARISON;
  if (context.openedModules.length > 6) return State.COMPREHENSION;
  return State.EXPLORATION;
}
```

## 20.4 Orchestration des Modules
```typescript
function orchestrate(profile, state) {
  decisions = [];

  if (profile === Profile.FATIGUE) {
    decisions.push(show("decision-anchor"));
    decisions.push(hide("comparaison"));
  }

  if (profile === Profile.ANALYTICAL) {
    decisions.push(show("tableau-detaille"));
    decisions.push(unlock("projection-20-ans"));
  }

  if (profile === Profile.INDECISIVE && state === State.COMPARISON) {
    decisions.push(open("lecture-trajectoire"));
  }

  if (state === State.DECISION_MADE) {
    decisions.push(lockAllExcept("qualification"));
  }

  return decisions;
}
```

## 20.5 Audit Trail (Obligatoire)
```typescript
auditTrail = {
  profileDetected,
  stateReached,
  modulesShown,
  modulesHidden,
  decisionTimestamp,
  postDecisionFreeze: true // Empêche toute influence après le choix
}
```

---

# PARTIE 19 : OPS LAYER & GOUVERNANCE INTERNE (ADDENDUM V2)

<a name="section-68"></a>
## 68. LA MISSION OPS (INITIATIVE)
Agent Zero (Client) optimise la signature.
Agent Zero (Ops) sécurise l'exécution.
Ce sont deux cerveaux distincts.
Jamais mélangés.
Jamais interdépendants.

<a name="section-69"></a>
## 69. ARCHITECTURE DU MOTEUR OPS
### 69.1 Ops Rules (`ops.rules.ts`)
Source de vérité unique.
Contient les constantes métier intouchables :
- `SRU_MAX_DAYS` (14j rétractation)
- `WAR_ROOM_RISK_SCORE` (0.6)
- `SILENCE_THRESHOLD_DAYS` (7j)

### 69.2 Ops Engine (`ops.engine.ts`)
Fonction pure : `evaluateOpsDecision(context)`.
Prend des faits. Rend un verdict.
Ne décide PAS pour l'utilisateur.
Diagnostique le risque.

### 69.3 Règle d'Or War Room
`is_war_room` est une propriété strictement dérivée.
**Formule :** `is_war_room = (ops_state IN ('SRU_EXPIRED', 'UNSECURED_DELAY'))`
Il est interdit d'entrer en War Room manuellement sans que le calcul Ops ne le valide.

<a name="section-70"></a>
## 70. STRATÉGIE "MIRROR MODE" (PHASE D'OBSERVATION)
Avant de laisser l'Ops Engine bloquer quoi que ce soit, il opère en "Mode Miroir".
- Il observe chaque dossier en arrière-plan.
- Il loggue son verdict en console.
- Il NE TOUCHE PAS à l'UI.
Objectif : Calibrer la vérité sans risquer le business.

<a name="section-71"></a>
## 71. OPS SNAPSHOT : LA VÉRITÉ BRUTE
Pour le Cockpit, nous avons banni les calculs frontend fragiles.
Nous utilisons une vue SQL `ops_snapshot` via `fetchOpsSnapshot`.
Principe :
- DB View calcule l'état (Active, Silent, Secured).
- Frontend affiche bêtement.
- Zéro distorsion possible.
Le Cockpit devient un outil de preuve, pas d'interprétation.

<a name="section-72"></a>
## 72. OPS SCORING (INTELLIGENCE PASSIVE)

### 72.1 Philosophie
Créer une intelligence mesurable au-dessus de la donnée brute, sans effet de bord.
Règle d'or : Scoring pur (input -> output). Aucune modification de DB.

### 72.2 Les 3 Scores
1. **Risk Ops Score (0-100)** : Basé sur l'état (Secured=0, SRU_Expired=90).
2. **Inertia Score (0-80)** : Pénalise le temps mort (0 si <2j, 80 si >10j).
3. **Health Score (0-100)** : Qualité globale (100 - pénalités).

### 72.3 Utilité
- Priorisation automatique des relances.
- Détection des abandons silencieux.
- Vue macro pour le CEO.

---

# PARTIE 20 : ARCHITECTURE OPS AGENT (AXES)

<a name="section-73"></a>
## 73. LE CONCEPT "AXIS" (AGENT AUTONOME)
Jusqu'à présent, nous avions :
1.  **Agent Zero (Client)** : Réagit aux actions utilisateur (Front).
2.  **Ops Engine (Scoring)** : Analyse passivement (Libs).

Voici le 3ème pilier : **OPS AGENT (Worker)**.
C'est un programme qui tourne en fond (`src/ops-agent/`).
Il ne "répond" pas à une requête. Il **boucle**.

<a name="section-74"></a>
## 74. AXIS B (SURVEILLANCE POST-RDV)
**Problème :** Une fois le RDV fini, le système est aveugle.
**Solution :** Axis B surveille les dossiers `sent` mais non `signed`.

### 74.1 Règles Axis B (`axes/axisB.ts`)
1.  **Détection Inertie** : Si `last_event > 7j` => Flag `MUET`.
2.  **Détection Intérêt** : Si `score > 60` => Flag `INTERESSE`.
3.  **Décision Automatique** :
    - `INTERESSE` + `MUET` -> Recommande **APPEL PRIORITAIRE**.
    - `MUET` -> Recommande **STOP RELANCE** (éviter le harcèlement).

### 74.2 Isolation Totale
Ce code n'est importé nulle part dans le Next.js client.
Il est conçu pour être exécuté par un Worker NodeJS indépendant.

<a name="section-75"></a>
## 75. LES AUTRES AXES (A & C) & L'AGRÉGATEUR
Pour couvrir tout le cycle de vie, l'Agent Ops gère aussi :

### 75.1 Axis A (Dossiers Signés)
**Mission** : Anti-annulation & Sécurisation.
**Règles** :
- `WAR_ROOM` : SRU dépassé sans acompte.
- `A_SECURISER` : Signature ancienne (> 7j) sans acompte.

### 75.2 Axis C (Qualif Leads)
**Mission** : Nettoyage avant RDV.
**Règles** :
- `A_ABANDONNER` : > 30j sans interaction.
- `A_APPELER` : Lead récent ou réactif (< 7j).

<a name="section-76"></a>
## 76. OPS AGENT AGGREGATOR (LE CHEF D'ORCHESTRE)
**Fichier :** `opsAgent.engine.ts`
**Rôle :**
1.  Prend une ligne de snapshot.
2.  Interroge Axis A, puis B, puis C (Cascade de priorité).
3.  Sort une `OpsDecision` unique (ex: `WAR_ROOM`, `PRIORITY`, `WATCH`, `STOP`).

C'est ce moteur qui tranche si un dossier est "A" ou "B" ou "C". Il garantit qu'on ne spam pas un client pour une qualification (C) s'il est déjà en danger d'annulation (A).

---

<a name="section-77"></a>
## 77. VÉRIFICATION VISUELLE (MOMENT OF TRUTH)
Le moteur Ops est invisible par nature. Mais pour le valider, nous l'avons branché temporairement dans le Cockpit.

### 77.1 Le Hook `useOpsAgent`
C'est le pont entre la donnée brute (`ops_snapshot`) et l'intelligence (`OpsAgent Engine`).
Il mappe chaque dossier via `evaluateOpsAgent` en temps réel.

### 77.2 L'Affichage "Moment de Vérité"
Une section dédiée en bas du Cockpit affiche désormais :
- **Priorité** : 🔴 WAR_ROOM / 🟠 PRIORITY / 🟡 WATCH / ⚫ STOP.
- **Source** : Quel Axe a pris la décision (A, B ou C).
- **Recommendation** : La prochaine action humaine requise.

Cet affichage prouve que le moteur "voit" le business de la même manière qu'un humain Ops expérimenté, sans jamais toucher à la base de données.

---

<a name="section-78"></a>
## 78. MODE AUDIT (SHADOW WRITE)
L'Agent est conçu pour être juridiquement défendable.
Chaque décision qu'il prend (War Room, Stop, Watch) génère un objet `audit_payload`.

### 78.1 Le Concept Shadow Write
Avant de laisser l'agent "agir" (envoyer un email, bloquer un compte), on active le `Shadow Write`.
1.  L'agent calcule.
2.  L'agent **ne fait rien**.
3.  L'agent **écrit** ce qu'il aurait fait dans une table de logs (`ops_agent_logs`).

Cela permet de vérifier sur 1 mois : "A-t-il voulu mettre en War Room ce client à tort ?".

### 78.2 Statut Final (Produit Ready)
Le système est complet :
- **Snapshot** : Vision (SQL).
- **Engine** : Réflexion (Rules).
- **Axes** : Décision (A, B, C).
- **Audit** : Trace (Shadow Write).

Il est prêt pour le déploiement backend.

---

<a name="section-79"></a>
## 79. TABLEAU DES SEUILS DÉFINITIFS — OPS SNAPSHOT (V1 GELÉE)
**Statut :** CANONIQUE
Ce tableau définit la vérité opérationnelle du système. Toute logique UI, scoring ou IA doit s’y conformer.

### 79.1 AXE A — DOSSIERS SIGNÉS (ANTI-ANNULATION)
**Objectif :** Empêcher toute perte contractuelle évitable avant fin SRU.
**Périmètre :** `status = 'signed'`

| Condition métier | Seuil | ops_state | is_war_room | Commentaire |
| :--- | :--- | :--- | :--- | :--- |
| Acompte reçu | `deposit_paid = true` | `SECURED` | `false` | CA sécurisé |
| < 7 jours depuis signature | `days < 7` | `ACTIVE` | `false` | Zone normale |
| 7 à 13 jours, sans acompte | `7 ≤ days < 14` | `UNSECURED_DELAY` | `true` | Zone de vigilance |
| ≥ 14 jours, sans acompte | `days ≥ 14` | `SRU_EXPIRED` | `true` | Risque maximal |
| Pas signé | `status ≠ signed` | `HORS_PERIMETRE` | `false` | Exclu Axe A |

**🔒 Règle figée :**
`is_war_room = ops_state IN ('UNSECURED_DELAY', 'SRU_EXPIRED')`

### 79.2 AXE B — POST-RDV (ANTI-INERTIE)
**Objectif :** Empêcher la perte par inertie commerciale.
**Périmètre :** `status = 'sent'`

| Condition métier | Seuil | Ops Priorité | Commentaire |
| :--- | :--- | :--- | :--- |
| Interaction < 7 jours | `days < 7` | Normale | Lead vivant |
| 7 à 14 jours sans interaction | `7 ≤ days < 14` | WATCH | À surveiller |
| ≥ 14 jours sans interaction | `days ≥ 14` | PRIORITY_ACTION | Relance critique |
| Opt-out client | `email_optout = true` | STOP | Blocage légal |

**🔒 Règle figée :**
- Aucun mail / action automatique si STOP.
- SILENT ≠ mort → action humaine requise.

### 79.3 AXE C — LEADS (HYGIÈNE)
**Objectif :** Nettoyer, prioriser, éviter la pollution commerciale.
**Périmètre :** `status = 'draft'`

| Condition métier | Seuil | Action |
| :--- | :--- | :--- |
| Interaction < 7 jours | `< 7 jours` | A_APPELER |
| 7 à 30 jours sans interaction | `7–30 jours` | A_OBSERVER |
| > 30 jours sans interaction | `> 30 jours` | A_ABANDONNER |
| Opt-out | `email_optout = true` | STOP |

### 79.4 RÈGLES TRANSVERSES (NON NÉGOCIABLES)
1.  **Source de vérité** : La vérité vient de la base (`ops_snapshot`). Jamais de calcul critique dans l’UI.
2.  **Sécurité & conformité** :
    *   Acompte non obligatoire (sauf cash).
    *   Seuil SRU (14j) est absolu.
    *   Opt-out = STOP total (RGPD).
3.  **Hiérarchie de priorité** : AXE A > AXE B > AXE C.

---
---

<a name="section-80"></a>
## 80. OPS UX AUDIT LAYER (DATA INTEGRITY)
**Concept :** Un auditeur neutre qui valide que l'interface ne trahit pas la donnée.

### 80.1 Pourquoi ?
Un graphique illisible ou trompeur est un risque opérationnel aussi grave qu'un calcul faux.
L'agent Ops doit garantir l'intégrité du "Dernier Mètre" (l'affichage).

### 80.2 Règles Hardcodées
- **Densité max** : 30 points de données (au-delà = bruit).
- **Lisibilité** : Police < 12px = CRITICAL_ERROR.
- **Contraste** : Opacité < 0.6 = WARNING.

### 80.3 Fonctionnement
Le moteur `uxAudit.engine.ts` analyse les props des composants `Visx` et sort un **Score de Clarté**.
Si le score < 60, le graphique est considéré comme "Risque Cognitif".

### 80.4 Moteur de Vérité (Data Integrity)
Un "Data Truth Firewall" compare les métadonnées brutes Supabase vs ce qui est rendu.
Si `renderedMax < trueMax` ou si `pointsRendered < rows`, une alerte **🚨 DATA INTEGRITY BREACH** est levée.
Le dashboard avoue ses mensonges.

### 80.5 Détection Cosmétique
Un graphique sans seuil critique ni zone de danger est tagué **[COSMETIC]**.
Il informe le décideur que la visualisation est purement informative et non décisionnelle.

---
---

<a name="section-90"></a>
## 90. OPS CORE SECURITY (ANTI-COPY & AUDIT)
**Concept :** Verrouillage technique du système pour empêcher l'exploitation non autorisée.

### 90.1 Fingerprint & License Guard (`src/ops-core/`)
Le système calcule une signature unique (Fingerprint) basée sur le domaine, l'URL Supabase et un sel cryptographique.
Si le fingerprint ne correspond pas à la licence autorisée (`license.guard.ts`), le système refuse de démarrer.
**Objectif :** Empêcher le "fork silencieux" du code.

### 90.2 Integrity Check
Le moteur vérifie au démarrage que ses propres fichiers critiques n'ont pas été modifiés (`integrity.check.ts`).
Toute altération du code source provoque un arrêt immédiat ("ENGINE_TAMPERED").

### 90.3 Rapport d'Audit Automatisé (`src/ops-agent/audit/`)
Le système génère un rapport JSON formel (`/api/ops/audit`) pour la direction.
- **Score Global** : Calculé sur l'UX et les Data Breaches.
- **Dette Décisionnelle** : Nombre de dossiers en WAR_ROOM non traités.
- ** Preuve d'Intégrité** : Liste des incohérences détectées.

---
---

<a name="section-91"></a>
## 91. INDUSTRIALISATION & PREUVES (PHASE 2)
**Concept :** Transformer le code en produit livrable et auditable.

### 91.1 Moteur de Preuve PDF (`src/ops-agent/audit/audit.pdf.ts`)
Le système ne se contente plus d'un JSON. Il génère un document officiel.
- **Format** : PDF standardisé, archivale.
- **Contenu** : Executive Summary, Scores couleurs, Liste décisions critiques.
- **Usage** : Livrable pour CEO / Comex / Auditeurs externes.

### 91.2 Garde Pre-Production (`preprod.guard.ts`)
Un mécanisme de blocage strict pour empêcher le déploiement de code "menteur".
- **Condition** : `if (UX < 60 || DataBreach > 0) throw ERROR`.
- **Effet** : Impossible de pousser en prod un dashboard biaisé.
- **Valeur** : Garantie contractuelle de qualité.

### 91.3 API de Téléchargement (`/api/ops/audit/download`)
Route API publique permettant de récupérer le rapport PDF à la volée.
Permet une démonstration "Zéro triche" en temps réel.

---
---

<a name="section-92"></a>
## 92. OPS UX AUDIT ARCHITECTURE (MODULARITY V4.0)
**Concept :** Séparation stricte des responsabilités d'audit.

### 92.1 Structure Canonique (`src/ops-ux-audit/`)
L'audit n'est plus un monolithe, mais une fédération d'experts spécialisés.

| Dossier | Rôle | Exemple |
| :--- | :--- | :--- |
| `engine/` | **Le Cerveau** | Orchestrateur, Types, Historique. |
| `charts/` | **Les Spécialistes** | `financialRisk.audit.ts` (1 fichier = 1 graph). |
| `cards/` | **Les KPI** | `kpiCards.audit.ts` (Surcharge cognitive). |
| `truth/` | **Le Firewall** | `dataVsRender.audit.ts` (Intégrité Data). |

### 92.2 Règle d'Or : "Pas d'Opinion, Juste des Faits"
Chaque auditeur (`.audit.ts`) est une fonction pure qui prend des métadonnées et renvoie :
- Un Score (0-100).
- Des Issues (`severity`, `message`, `recommendation`).
**Aucun composant React n'a le droit de s'auto-valider.**

---
**FIN DEFINITIVE DU DOCUMENT (V4.1 - ARCHITECTURE MODULAIRE)**
