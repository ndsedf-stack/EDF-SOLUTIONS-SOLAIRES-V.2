# SECTION 68 — SPEECHVIEW v1.1 (PHILOSOPHIE ANTI-PERFECTION)

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
