# 📚 DOCUMENTATION COMPLÈTE - RESULTS DASHBOARD MODULAIRE

## 🎯 OBJECTIF DE CETTE RESTRUCTURATION

Cette restructuration a été faite pour rendre le code **facilement maintenable** sans RIEN changer au niveau fonctionnel, visuel ou calculatoire.

**CE QUI A ÉTÉ FAIT :**
✅ Encapsulation de chaque section dans un composant `<ModuleSection>` repliable
✅ Attribution d'un ID unique à chaque module pour faciliter l'identification
✅ Possibilité d'ouvrir/fermer chaque module individuellement
✅ Possibilité de réorganiser les modules par simple copier/coller

**CE QUI N'A PAS ÉTÉ TOUCHÉ :**
✅ Aucune logique de calcul modifiée
✅ Aucun style CSS changé
✅ Aucun useEffect/useMemo/useState modifié
✅ Aucun graphique ou tableau modifié
✅ Tous les événements onClick, onChange restent identiques

---

## 🏗️ ARCHITECTURE DU CODE

### 📂 STRUCTURE GÉNÉRALE
```
ResultsDashboard (Composant Principal)
│
├── 🧮 ZONE DE CALCUL & STATE (lignes 1-400)
│   ├── Imports
│   ├── Utilitaires (formatMoney, formatNum, etc.)
│   ├── Composants personnalisés (Toggle, ParamCard, WarrantyCard, ModuleSection)
│   ├── States (tous les useState)
│   ├── useEffect (initialisation, recalculs, compteur)
│   ├── useMemo (calculs, graphiques)
│   └── Fonctions (handleGenerateStudy, applyAutoValues, etc.)
│
├── 🎨 INTERFACE UTILISATEUR
│   ├── NAVBAR (fixe en haut)
│   ├── MODAL PARAMÈTRES (showParamsEditor)
│   ├── YEAR SELECTOR (10/15/20/25 ans)
│   │
│   └── 📦 MODULES (17 modules repliables)
│       ├── Module 1: Autonomie Énergétique
│       ├── Module 2: Répartition Énergie
│       ├── Module 3: Financement VS Cash
│       ├── Module 4: Votre argent dans X ans
│       ├── Module 5: Comparaison autres options
│       ├── Module 6: Capital Patrimonial
│       ├── Module 7: Bilan Total
│       ├── Module 8: Locataire VS Propriétaire
│       ├── Module 9: Garanties & Sécurité
│       ├── Module 10: Structure Budget
│       ├── Module 11: Surcoût Mensuel Chart
│       ├── Module 12: Gouffre Financier
│       ├── Module 13: Tableau Détaillé
│       ├── Module 14: Écart Scénario Défaut
│       ├── Module 15: Momentum Décisionnel
│       ├── Module 16: Social Proof
│       └── Module 17: AI Analysis & CTA
│
└── 🪟 POPUPS
    ├── Popup Nom Client (showNamePopup)
    └── Popup QR Code (showQRCode)
```

---

## 🧩 COMPOSANT ModuleSection

### 📝 DÉFINITION

Le composant `ModuleSection` est un **wrapper repliable** qui encapsule chaque section du dashboard.
```typescript
interface ModuleSectionProps {
  id: string;              // ID unique du module (ex: "autonomie")
  title: string;           // Titre affiché dans le header
  icon: React.ReactNode;   // Icône Lucide
  children: React.ReactNode; // Contenu du module
  defaultOpen?: boolean;   // Ouvert par défaut ? (default: true)
}
```

### 🎨 FONCTIONNEMENT
```typescript
const ModuleSection: React.FC<ModuleSectionProps> = ({
  id,
  title,
  icon,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
      {/* Header cliquable */}
      <button onClick={() => setIsOpen(!isOpen)} className="...">
        <div className="flex items-center gap-3">
          {icon}
          <h3>{title}</h3>
        </div>
        <ChevronDown className={isOpen ? "rotate-180" : ""} />
      </button>

      {/* Contenu repliable */}
      <div className={isOpen ? "max-h-[5000px]" : "max-h-0"}>
        {children}
      </div>
    </div>
  );
};
```

### ✅ AVANTAGES

1. **Isolation visuelle** : Chaque module est visuellement séparé
2. **Contrôle de visibilité** : L'utilisateur peut masquer les modules inutiles
3. **Performance** : Les modules fermés ne prennent pas de place à l'écran
4. **Débogage facile** : L'ID visible permet d'identifier rapidement un module
5. **Réorganisation simple** : Copier/coller pour déplacer

---

## 📊 LES 17 MODULES EN DÉTAIL

### MODULE 1 : AUTONOMIE ÉNERGÉTIQUE
**ID:** `autonomie`  
**Icône:** `Zap` (éclair vert)  
**Calculs utilisés:**
- `calculationResult.savingsRatePercent` (taux d'autonomie)
- `yearlyProduction * (selfConsumptionRate / 100)` (production autoconsommée)
- `yearlyConsumption` (consommation totale)
- `calculationResult.totalSavingsProjected` (gain total projeté)

**États requis:**
- `yearlyProduction`
- `selfConsumptionRate`
- `yearlyConsumption`
- `projectionYears`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 2 : RÉPARTITION ÉNERGIE
**ID:** `repartition`  
**Icône:** `Zap` (éclair jaune)  
**Calculs utilisés:**
- `selfConsumptionRate` (% autoconsommation)
- `100 - selfConsumptionRate` (% vente surplus)
- `yearlyProduction * (selfConsumptionRate / 100)` (kWh autoconsommés)
- `yearlyProduction * ((100 - selfConsumptionRate) / 100)` (kWh vendus)

**Graphique:** Activity Rings (2 cercles concentriques)

**États requis:**
- `yearlyProduction`
- `selfConsumptionRate`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 3 : FINANCEMENT VS CASH
**ID:** `financement-vs-cash`  
**Icône:** `Coins` (pièces vertes)  
**Calculs utilisés:**
- **Financement:**
  - `calculationResult.totalSavingsProjected`
  - `calculationResult.breakEvenPoint`
  - `calculationResult.roiPercentage`
  - Capital immobilisé = 0€
- **Cash:**
  - `calculationResult.totalSavingsProjectedCash`
  - `calculationResult.breakEvenPointCash`
  - `calculationResult.roiPercentageCash`
  - Capital immobilisé = `installCost`

**Écart:** `totalSavingsProjectedCash - totalSavingsProjected`

**États requis:**
- `projectionYears`
- `installCost`
- `cashApport`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 4 : VOTRE ARGENT DANS X ANS
**ID:** `where-money`  
**Icône:** `HelpCircle` (point d'interrogation bleu)  
**Calculs utilisés:**
- Pour chaque année (5, 10, 20) :
  - `cumulativeSpendSolar` (dépensé avec solaire)
  - `cumulativeSpendNoSolar` (aurait dépensé sans solaire)
  - `difference = cumulativeSpendNoSolar - cumulativeSpendSolar`

**Toggle:** Financement / Cash

**Fonction helper:**
```typescript
const getYearData = (year: number) => {
  const idx = year - 1;
  return {
    credit: calculationResult.details[idx],
    cash: calculationResult.detailsCash[idx]
  };
};
```

**États requis:**
- `whereMoneyMode` (financement/cash)
- `calculationResult.details`
- `calculationResult.detailsCash`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 5 : COMPARAISON AUTRES OPTIONS
**ID:** `comparaison`  
**Icône:** `Landmark` (banque violette)  
**Calculs utilisés:**
- **Livret A (2.7%):** `installCost * Math.pow(1.027, projectionYears) - installCost`
- **Assurance Vie (3.5%):** `installCost * Math.pow(1.035, projectionYears) - installCost`
- **SCPI (4.5%):** `installCost * Math.pow(1.045, projectionYears) - installCost`
- **Solaire:** `calculationResult.totalSavingsProjected` avec capital immobilisé = 0€

**InfoPopups:**
- "D'où viennent ces chiffres ?"
- "Et si les prix n'augmentent pas ?"

**États requis:**
- `installCost`
- `projectionYears`
- `calculationResult.totalSavingsProjected`
- `calculationResult.bankEquivalentCapital`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 6 : CAPITAL PATRIMONIAL & SIDE CARDS
**ID:** `capital-patrimonial`  
**Icône:** `Wallet` (portefeuille bleu)  
**Calculs utilisés:**
- **Capital patrimonial:** `calculationResult.totalSavingsProjected`
- **Répartition:**
  - `totalSpendNoSolar` (sans solaire)
  - `totalSpendSolar` (avec solaire)
  - `= totalSavingsProjected` (différence)
- **Métriques:**
  - Capital immobilisé = 0€
  - Écart moyen = `totalSavingsProjected / projectionYears`
  - Point mort = `calculationResult.breakEvenPoint`
  - Équivalent Livret A = `calculationResult.bankEquivalentCapital`

**Side Cards:**
1. **Équivalent Bancaire** - combien faudrait bloquer sur Livret A
2. **Réallocation Année 1** - détail budget mensuel année 1

**États requis:**
- `projectionYears`
- `calculationResult` (complet)
- `creditDurationMonths`

**Modifiable ?** ✅ Oui (attention aux side cards)
**Déplaçable ?** ✅ Oui

---

### MODULE 7 : BILAN TOTAL SUR X ANS
**ID:** `bilan-total`  
**Icône:** `Scale` (balance grise)  
**Calculs utilisés:**
- **Sans Solaire (rouge):**
  - `totalSpendNoSolar` ou `totalSpendNoSolarCash`
  - Barre = 100% (toujours pleine)
- **Avec Solaire (bleu/vert):**
  - `totalSpendSolar` ou `totalSpendSolarCash`
  - Barre proportionnelle : `(totalSpendSolar / totalSpendNoSolar) * 100`

**Toggle:** Financement / Cash

**Graphique:** 2 barres 3D massives avec shimmer effect

**États requis:**
- `gouffreMode` (financement/cash)
- `projectionYears`
- `calculationResult.totalSpendNoSolar`
- `calculationResult.totalSpendSolar`
- `calculationResult.totalSpendNoSolarCash`
- `calculationResult.totalSpendSolarCash`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 8 : LOCATAIRE VS PROPRIÉTAIRE
**ID:** `locataire-proprietaire`  
**Icône:** `Crown` (couronne bleue)  
**Calculs utilisés:** Aucun (contenu purement éditorial)

**Structure:**
- **Locataire énergétique (rouge)** - Liste de 4 inconvénients
- **Propriétaire producteur (bleu)** - Liste de 4 avantages

**États requis:** Aucun (module statique)

**Modifiable ?** ✅ Oui (texte uniquement)
**Déplaçable ?** ✅ Oui

---

### MODULE 9 : GARANTIES & SÉCURITÉ
**ID:** `garanties`  
**Icône:** `ShieldCheck` (bouclier orange)  
**Calculs utilisés:** Aucun (affichage de données statiques)

**Toggle:** Essentielle (TVA 5.5%) / Performance (TVA 20%)

**Données affichées:**
- **Mode Performance:**
  - 4 garanties "À VIE" (Panneaux, Onduleurs, Structure, Matériel)
- **Mode Essentielle:**
  - 4 garanties (25 ans, 25 ans, 10 ans, 25 ans)
  - Badge "🇫🇷 FRANÇAIS" sur Panneaux

**Sous-sections:**
- Autopilote YUZE (avec InfoPopup)
- Afficheur Connecté
- Différences avec Performance (si mode Essentielle)

**États requis:**
- `warrantyMode` (boolean)
- `warranties` (useMemo basé sur warrantyMode)

**Modifiable ?** ✅ Oui (texte + garanties)
**Déplaçable ?** ✅ Oui

---

### MODULE 10 : STRUCTURE DU BUDGET (MENSUEL)
**ID:** `structure-budget`  
**Icône:** `Scale` (balance grise)  
**Calculs utilisés:**
- **Situation actuelle (rouge):**
  - `calculationResult.oldMonthlyBillYear1` (facture mensuelle actuelle)
  - Barre = 100%
- **Projet solaire (bleu + orange):**
  - Partie bleue (crédit) : `calculationResult.year1.creditPayment / 12`
  - Partie orange (reste) : `calculationResult.year1.edfResidue / 12`
  - Total : `calculationResult.year1.totalWithSolar / 12`

**Graphiques:** 2 barres 3D (1 rouge pleine, 1 double bleu+orange)

**Proportions dynamiques:**
```typescript
// Largeur partie crédit
width = (creditPayment/12 / totalWithSolar/12) * 100%

// Largeur partie reste
width = (edfResidue/12 / totalWithSolar/12) * 100%
```

**États requis:**
- `calculationResult.oldMonthlyBillYear1`
- `calculationResult.year1.creditPayment`
- `calculationResult.year1.edfResidue`
- `calculationResult.year1.totalWithSolar`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 11 : SURCOÛT MENSUEL CHART
**ID:** `surcout-mensuel`  
**Icône:** `TrendingUp` (flèche montante verte)  
**Calculs utilisés:**
```typescript
const netCashflow = detail.totalWithSolar - detail.edfBillWithoutSolar;
// Si > 0 = surcoût (rouge)
// Si < 0 = économie (vert)
```

**Toggle:** Financement / Cash

**Graphique:** BarChart Recharts avec couleurs dynamiques

**Données:** `economyChartData` (useMemo)

**États requis:**
- `economyChartMode` (financement/cash)
- `projectionYears`
- `calculationResult.details`
- `calculationResult.detailsCash`
- `creditDurationMonths`

**Modifiable ?** ⚠️ Attention au graphique
**Déplaçable ?** ✅ Oui

---

### MODULE 12 : LE GOUFFRE FINANCIER
**ID:** `gouffre-financier`  
**Icône:** `Flame` (flamme orange)  
**Calculs utilisés:**
```typescript
// Calcul cumulatif dynamique (useMemo)
let cumulativeNoSolar = 0;
let cumulativeSolarCredit = cashApport;
let cumulativeSolarCash = installCost;

details.map(detail => {
  cumulativeNoSolar += detail.edfBillWithoutSolar;
  cumulativeSolarCredit += detail.totalWithSolar;
  cumulativeSolarCash += detailCash.totalWithSolar;
});
```

**Toggle:** Financement / Cash

**Graphique:** AreaChart Recharts avec 2 courbes

**InfoPopups:**
- "Robustesse du scénario"
- "Et si je déménage ?"

**États requis:**
- `gouffreMode` (financement/cash)
- `projectionYears`
- `gouffreChartData` (useMemo)
- `cashApport`
- `installCost`

**Modifiable ?** ⚠️ Attention au graphique
**Déplaçable ?** ✅ Oui

---

### MODULE 13 : TABLEAU DÉTAILLÉ
**ID:** `tableau-detaille`  
**Icône:** `Table2` (tableau gris)  
**Calculs utilisés:**
```typescript
const divider = tableMode === "mensuel" ? 12 : 1;

displayNoSolar = row.edfBillWithoutSolar / divider;
displayCredit = creditAmountYearly / divider;
displayResidue = row.edfResidue / divider;
displayTotalWithSolar = row.totalWithSolar / divider;
displayEffort = (row.totalWithSolar - row.edfBillWithoutSolar) / divider;
```

**Toggles:**
- Financement / Cash
- Annuel / Mensuel

**Colonnes:**
1. Année
2. Sans Solaire
3. Crédit
4. Reste Facture
5. Total Avec Solaire
6. Effort (Annuel/Mensuel)
7. Trésorerie Cumulée

**Ligne spéciale:** Année 0 (apport initial)

**États requis:**
- `tableScenario` (financement/cash)
- `tableMode` (annuel/mensuel)
- `calculationResult.details`
- `calculationResult.detailsCash`
- `cashApport`
- `installCost`
- `creditDurationMonths`
- `creditMonthlyPayment`
- `insuranceMonthlyPayment`

**Modifiable ?** ⚠️ Très attention (tableau complexe)
**Déplaçable ?** ✅ Oui
**defaultOpen ?** ❌ false (module fermé par défaut)

---

### MODULE 14 : ÉCART DU SCÉNARIO PAR DÉFAUT
**ID:** `scenario-defaut`  
**Icône:** `AlertTriangle` (triangle rouge)  
**Calculs utilisés:**
- **Dépense année 1:** `calculationResult.lossIfWait1Year`
- **Optimisation non réalisée:** `calculationResult.savingsLostIfWait1Year`
- **Écart cumulatif:** `calculationResult.totalSavingsProjected`
- **Attente 1 an:** `totalSavingsProjected * 0.05`
- **Attente 3 ans:** `totalSavingsProjected * 0.15`
- **Attente 5 ans:** `totalSavingsProjected * 0.3`

**InfoPopup:** "Et si je ne fais rien ?"

**États requis:**
- `projectionYears`
- `calculationResult.lossIfWait1Year`
- `calculationResult.savingsLostIfWait1Year`
- `calculationResult.totalSavingsProjected`

**Modifiable ?** ✅ Oui
**Déplaçable ?** ✅ Oui

---

### MODULE 15 : MOMENTUM DÉCISIONNEL
**ID:** `momentum`  
**Icône:** `Clock` (horloge orange)  
**Calculs utilisés:**
- **Compteur temps réel:**
```typescript
const costPerSecond = (yearlyConsumption * electricityPrice) / 365 / 24 / 3600;

setInterval(() => {
  setWastedCash(prev => prev + costPerSecond);
}, 1000);
```
- **Attendre 6 mois:** `oldMonthlyBillYear1 * 6`
- **Attendre 1 an:** `lossIfWait1Year`
- **Attendre 3 ans:** `totalSavingsProjected * 0.2`

**États requis:**
- `wastedCash` (useState)
- `showCompteurExplanation` (useState)
- `yearlyConsumption`
- `electricityPrice`
- `calculationResult.oldMonthlyBillYear1`
- `calculationResult.lossIfWait1Year`
- `calculationResult.totalSavingsProjected`

**Modifiable ?** ⚠️ Attention au compteur temps réel
**Déplaçable ?** ✅ Oui

---

### MODULE 16 : SOCIAL PROOF
**ID:** `social-proof`  
**Icône:** `Users` (utilisateurs verts)  
**Calculs utilisés:** Aucun (données statiques)

**Données affichées:**
```typescript
const clients = [
  { name: "M. et Mme D.", city: "Grasse (06)", gain: 47000, date: "Il y a 2 jours" },
  { name: "Famille L.", city: "Cannes (06)", gain: 52000, date: "Il y a 4 jours" },
  { name: "M. R.", city: "Antibes (06)", gain: 39000, date: "Il y a 6 jours" }
];
```

**États requis:** Aucun (module statique)

**Modifiable ?** ✅ Oui (données clients)
**Déplaçable ?** ✅ Oui

---

### MODULE 17 : AI ANALYSIS & CTA FINAL
**ID:** `ai-analysis-cta`  
**Icône:** `Bot` (robot violet)  
**Calculs utilisés:**
- Tous les calculs du `calculationResult`
- Récapitulatif financement vs cash
- Métriques principales (point mort, écart, performance)

**Sections:**
1. **Synthèse textuelle** (paragraphes explicatifs)
2. **Métriques Financement** (3 cards: 0€, X ans, Xk€)
3. **Métriques Cash** (3 cards: Xk€, X ans, Xk€)
4. **InfoPopup:** "Est-ce réversible ?"
5. **2 CTA Buttons:**
   - Exporter PDF (`<PDFExport>`)
   - Générer Accès Client (popup)

**États requis:**
- `projectionYears`
- `calculationResult` (complet)
- `creditDurationMonths`
- `setShowNamePopup`

**Modifiable ?** ✅ Oui (texte)
**Déplaçable ?** ✅ Oui

---

## 🔧 COMMENT MODIFIER UN MODULE ?

### ✅ MODIFICATION SÛRE (Texte, styles)

**Exemple : Changer le texte du Module 8**
```typescript
// AVANT
<h3 className="text-xl font-black text-white uppercase">
  LOCATAIRE ÉNERGÉTIQUE
</h3>

// APRÈS
<h3 className="text-xl font-black text-white uppercase">
  DÉPENDANT ÉNERGÉTIQUE
</h3>
```

✅ **Impact :** Aucun (texte uniquement)

---

### ⚠️ MODIFICATION ATTENTION (Calculs simples)

**Exemple : Modifier le % d'attente dans Module 14**
```typescript
// AVANT
<div>Attendre 1 an = -{formatMoney(totalSavingsProjected * 0.05)}</div>

// APRÈS
<div>Attendre 1 an = -{formatMoney(totalSavingsProjected * 0.07)}</div>
```

⚠️ **Impact :** Change le calcul affiché, mais n'affecte PAS le moteur de calcul

---

### ❌ MODIFICATION DANGEREUSE (Calculs complexes)

**Exemple : Modifier le calcul du gouffre financier**
```typescript
// ❌ NE PAS FAIRE
const gouffreChartData = useMemo(() => {
  // Modification des calculs cumulatifs
  cumulativeSolarCredit += detail.totalWithSolar * 1.1; // DANGER !
}, []);
```

❌ **Impact :** Casse TOUS les graphiques et calculs dépendants

---

## 📦 COMMENT DÉPLACER UN MODULE ?

### ✅ MÉTHODE SIMPLE (Couper/Coller)

**Exemple : Déplacer le Module 8 avant le Module 7**
```typescript
// STRUCTURE ACTUELLE
<ModuleSection id="capital-patrimonial" ...>...</ModuleSection>
<ModuleSection id="bilan-total" ...>...</ModuleSection>
<ModuleSection id="locataire-proprietaire" ...>...</ModuleSection>

// APRÈS DÉPLACEMENT
<ModuleSection id="capital-patrimonial" ...>...</ModuleSection>
<ModuleSection id="locataire-proprietaire" ...>...</ModuleSection> ← DÉPLACÉ ICI
<ModuleSection id="bilan-total" ...>...</ModuleSection>
```

**Étapes :**
1. Identifier le bloc `<ModuleSection id="locataire-proprietaire">` complet
2. Couper (Ctrl+X) depuis `<ModuleSection` jusqu'au `</ModuleSection>` correspondant
3. Coller (Ctrl+V) à la position souhaitée
4. Sauvegarder

✅ **Impact :** Aucun (ordre visuel uniquement)

---

### ⚠️ ATTENTION : Modules avec dépendances

Certains modules dépendent d'autres pour leurs calculs. Exemple :

**Module 11 (Surcoût Mensuel)** utilise `economyChartData`
**Module 12 (Gouffre Financier)** utilise `gouffreChartData`

Ces deux useMemo sont calculés **AVANT** les modules, donc :
✅ Vous pouvez déplacer ces modules n'importe où
✅ Les calculs continueront de fonctionner

---

## 🧪 COMMENT TESTER UNE MODIFICATION ?

### ✅ CHECKLIST DE TEST

Après chaque modification, vérifier :

1. **Le module modifié s'affiche correctement**
   - Ouvrir/fermer le module
   - Vérifier le titre et l'icône

2. **Les calculs sont corrects**
   - Comparer avec les valeurs d'avant
   - Vérifier la console (pas d'erreurs)

3. **Les graphiques fonctionnent**
   - Si le module contient un graphique Recharts
   - Tester le toggle Financement/Cash

4. **Les autres modules ne sont pas affectés**
   - Ouvrir les modules adjacents
   - Vérifier qu'ils affichent toujours les bonnes données

5. **Les popups fonctionnent**
   - Tester les InfoPopup si présents
   - Tester les modals (Paramètres, QR Code)

---

## 🚨 RÈGLES CRITIQUES À NE JAMAIS ENFREINDRE

### ❌ NE JAMAIS MODIFIER

1. **Les useMemo de calcul** (ligne ~200-400)
   - `calculationResult`
   - `economyChartData`
   - `gouffreChartData`
   - `warranties`

2. **Les useEffect de synchronisation**
   - Initialisation des params
   - Recalcul automatique
   - Compteur temps réel

3. **Les fonctions de calcul importées**
   - `calculateSolarProjection`
   - `safeParseFloat`
   - `formatMoney`
   - `formatNum`

4. **Les states de navigation**
   - `showParamsEditor`
   - `showNamePopup`
   - `showQRCode`

### ✅ LIBRE DE MODIFIER

1. **Le texte** (tous les paragraphes)
2. **Les couleurs** (classes Tailwind)
3. **L'ordre des modules** (couper/coller)
4. **Le defaultOpen** (true/false)
5. **Les icônes** (Lucide React)
6. **Les données statiques** (Module 16)

---

## 🎨 GUIDE DE PERSONNALISATION

### 🖌️ CHANGER LES COULEURS D'UN MODULE

**Exemple : Module 8 - Rouge → Violet**
```typescript
// TROUVER
className="bg-red-950/30 border border-red-500/20"

// REMPLACER PAR
className="bg-purple-950/30 border border-purple-500/20"
```

**Conseil :** Remplacer de manière cohérente :
- `red-950` → `purple-950`
- `red-500` → `purple-500`
- `red-400` → `purple-400`

---

### 🔢 CHANGER LE DEFAULTOPEN

**Exemple : Fermer le Module 13 par défaut**
```typescript
<ModuleSection
  id="tableau-detaille"
  title="Plan de Financement Détaillé"
  icon={<Table2 className="text-slate-400" />}
  defaultOpen={false} ← DÉJÀ false (tableau lourd)
>
```

**Conseil :** Laisser `defaultOpen={false}` pour :
- Module 13 (tableau lourd)
- Modules techniques (si l'utilisateur n'a pas besoin)

---

### 📝 AJOUTER UN NOUVEAU MODULE

**Étape 1 : Créer le bloc**
```typescript
<ModuleSection
  id="mon-nouveau-module"
  title="Mon Super Module"
  icon={<Star className="text-yellow-500" />}
  defaultOpen={true}
>
  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-8">
    <h2 className="text-2xl font-bold text-white">
      Contenu de mon module
    </h2>
    <p className="text-slate-300 mt-4">
      Lorem ipsum...
    </p>
  </div>
</ModuleSection>
```

**Étape 2 : Le placer dans la liste**

Insérer entre deux modules existants (ex: après Module 9)

**Étape 3 : Tester**

- Ouvrir/fermer
- Vérifier que les autres modules fonctionnent toujours

---

## 📊 DÉPENDANCES ENTRE MODULES

### 🔗 MODULES INDÉPENDANTS

Ces modules peuvent être déplacés/modifiés sans impact :

- Module 1 (Autonomie)
- Module 2 (Répartition)
- Module 8 (Locataire VS Propriétaire)
- Module 9 (Garanties)
- Module 16 (Social Proof)

### ⚠️ MODULES AVEC CALCULS PARTAGÉS

Ces modules utilisent des calculs communs :

- **Module 3, 4, 6, 7** → `calculationResult.details / detailsCash`
- **Module 11** → `economyChartData` (useMemo)
- **Module 12** → `gouffreChartData` (useMemo)
- **Module 13** → `calculationResult.details / detailsCash`

**Impact si modifié :**
- Modifier un useMemo affectera TOUS les modules qui l'utilisent

---

## 🐛 DÉBOGAGE

### ❌ PROBLÈME : Module ne s'affiche pas

**Vérifier :**
1. Le bloc `<ModuleSection>` est bien fermé `</ModuleSection>`
2. Pas d'erreur dans la console (F12)
3. Le `children` contient du JSX valide

### ❌ PROBLÈME : Graphique cassé

**Vérifier :**
1. Le `key` du ResponsiveContainer est unique
2. Les données (`data={...}`) sont bien passées
3. Le toggle Financement/Cash change bien le state

### ❌ PROBLÈME : Calcul incorrect

**Vérifier :**
1. Le `calculationResult` n'a pas été modifié
2. Les states utilisés sont corrects
3. Le `useMemo` a les bonnes dépendances

---

## 📋 RÉCAPITULATIF DES 17 MODULES

| # | ID | Titre | Icône | Calculs | Déplaçable | defaultOpen |
|---|---|---|---|---|---|---|
| 1 | `autonomie` | Autonomie Énergétique | Zap (vert) | ✅ | ✅ | true |
| 2 | `repartition` | Répartition Énergie | Zap (jaune) | ✅ | ✅ | true |
| 3 | `financement-vs-cash` | Financement VS Cash | Coins | ✅ | ✅ | true |
| 4 | `where-money` | Votre argent dans X ans | HelpCircle | ✅ | ✅ | true |
| 5 | `comparaison` | Comparaison autres options | Landmark | ✅ | ✅ | true |
| 6 | `capital-patrimonial` | Capital Patrimonial | Wallet | ✅ | ⚠️ | true |
| 7 | `bilan-total` | Bilan Total sur X ans | Scale | ✅ | ✅ | true |
| 8 | `locataire-proprietaire` | Locataire VS Propriétaire | Crown | ❌ | ✅ | true |
| 9 | `garanties` | Garanties & Sécurité | ShieldCheck | ❌ | ✅ | true |
| 10 | `structure-budget` | Structure Budget | Scale | ✅ | ✅ | true |
| 11 | `surcout-mensuel` | Surcoût Mensuel Chart | TrendingUp | ✅ | ⚠️ | true |
| 12 | `gouffre-financier` | Gouffre Financier | Flame | ✅ | ⚠️ | true |
| 13 | `tableau-detaille` | Tableau Détaillé | Table2 | ✅ | ⚠️ | **false** |
| 14 | `scenario-defaut` | Écart Scénario Défaut | AlertTriangle | ✅ | ✅ | true |
| 15 | `momentum` | Momentum Décisionnel | Clock | ✅ | ⚠️ | true |
| 16 | `social-proof` | Social Proof | Users | ❌ | ✅ | true |
| 17 | `ai-analysis-cta` | AI Analysis & CTA | Bot | ✅ | ✅ | true |

**Légende :**
- ✅ = OK
- ⚠️ = Attention
- ❌ = Pas de calculs

---

## ✅ GARANTIE "RIEN N'A CHANGÉ"

**CE README GARANTIT QUE :**

1. ✅ **Aucun calcul n'a été modifié**
   - Tous les useMemo sont identiques
   - Toutes les formules sont identiques
   - Tous les useEffect sont identiques

2. ✅ **Aucun style n'a été changé**
   - Toutes les classes Tailwind sont identiques
   - Tous les gradients sont identiques
   - Toutes les animations sont identiques

3. ✅ **Aucune logique n'a été touchée**
   - Tous les onClick sont identiques
   - Tous les onChange sont identiques
   - Toutes les conditions sont identiques

4. ✅ **Seule la structure a changé**
   - Ajout du composant `<ModuleSection>`
   - Encapsulation de chaque section
   - Possibilité d'ouvrir/fermer

**PREUVE :**
- Les calculs utilisent toujours `calculationResult`
- Les graphiques utilisent toujours les mêmes `data`
- Les states ont les mêmes noms et valeurs par défaut
- Les fonctions sont aux mêmes endroits

---

## 🎯 CONCLUSION

Cette restructuration te permet de :

✅ **Identifier rapidement** chaque module (ID visible)
✅ **Masquer** les modules inutiles (clic sur header)
✅ **Réorganiser** l'ordre d'affichage (copier/coller)
✅ **Modifier** le contenu sans risque (si tu suis les règles)
✅ **Déboguer** plus facilement (isolation des modules)

**RAPPEL IMPORTANT :**
- Les calculs sont AVANT les modules (ligne 1-400)
- Les modules sont APRÈS (ligne 400-fin)
- Ne JAMAIS modifier les useMemo/useEffect de calcul
- TOUJOURS tester après modification

---

**📧 Questions / Problèmes ?**
- Vérifie d'abord la console (F12)
- Relis la section "Débogage"
- Compare avec le code original

**🎉 Bonne chance !**