# 🌞 NEXUS-CORE - Simulateur Solaire EDF

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Technologies utilisées](#technologies-utilisées)
3. [Installation & Déploiement](#installation--déploiement)
4. [Architecture du projet](#architecture-du-projet)
5. [Guide des sections](#guide-des-sections)
6. [Calculs financiers](#calculs-financiers)
7. [Personnalisation](#personnalisation)
8. [Maintenance](#maintenance)
9. [Dépannage](#dépannage)

---

## 🎯 VUE D'ENSEMBLE

### C'est quoi ?

**NEXUS-CORE** est un simulateur financier ultra-complet pour installations solaires photovoltaïques. Il permet de :

- 📊 **Calculer la rentabilité** d'une installation sur 20 ans
- 💰 **Comparer financement vs cash** avec calculs d'intérêts composés
- 📈 **Visualiser l'impact** de l'inflation sur les économies
- 🔄 **Ajuster en temps réel** tous les paramètres (taux, durée, prix kWh, etc.)
- 📉 **Analyser le point mort** (quand l'investissement devient rentable)
- 🎨 **Présenter professionnellement** avec graphiques interactifs

### À qui ça sert ?

- **Commerciaux solaires** : Présentation client ultra-professionnelle
- **Installateurs** : Outil de démonstration lors des rendez-vous
- **Clients** : Compréhension complète de leur investissement
- **Conseillers financiers** : Comparaison avec autres placements (Livret A, Assurance Vie, SCPI)

---

## 🛠️ TECHNOLOGIES UTILISÉES

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Typage strict
- **Vite** - Build tool ultra-rapide
- **Tailwind CSS** - Styling moderne

### Graphiques & Visualisation
- **Recharts** - Graphiques interactifs (barres, aires, camemberts)
- **Lucide React** - Bibliothèque d'icônes moderne

### Déploiement
- **Vercel** - Hébergement et CI/CD automatique
- **GitHub** - Versioning et collaboration

---

## 🚀 INSTALLATION & DÉPLOIEMENT

### Installation locale
```bash
# 1. Clone le repo
git clone https://github.com/ton-username/nexus-core.git
cd nexus-core

# 2. Installe les dépendances
npm install

# 3. Lance le serveur de développement
npm run dev

# 4. Ouvre http://localhost:5173
```

### Build de production
```bash
# Build optimisé
npm run build

# Preview du build
npm run preview
```

### Déploiement sur Vercel

#### Méthode automatique (recommandée)

1. **Connecte GitHub à Vercel** :
   - Va sur [vercel.com](https://vercel.com)
   - "Import Project" → Sélectionne ton repo GitHub
   - Vercel détecte automatiquement Vite
   - Clique "Deploy"

2. **Déploiement automatique** :
   - Chaque `git push` sur `main` déclenche un build automatique
   - Preview automatique pour chaque Pull Request
   - Rollback instantané si besoin

#### Configuration Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## 📁 ARCHITECTURE DU PROJET
```
nexus-core/
├── src/
│   ├── components/
│   │   ├── ResultsDashboard.tsx    # 🎯 Composant principal (2300+ lignes)
│   │   └── InputSlider.tsx         # Slider personnalisé
│   ├── utils/
│   │   └── finance.ts              # 💰 Moteur de calcul financier
│   ├── types.ts                    # 📐 Types TypeScript
│   ├── App.tsx                     # Point d'entrée
│   ├── index.tsx                   # Rendu React
│   └── index.css                   # Styles globaux + Tailwind
├── public/                         # Assets statiques
├── index.html                      # HTML de base
├── vite.config.ts                  # Config Vite
├── tailwind.config.js              # Config Tailwind
├── tsconfig.json                   # Config TypeScript
└── package.json                    # Dépendances
```

### Fichiers clés

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `ResultsDashboard.tsx` | Interface complète du dashboard | ~2300 |
| `finance.ts` | Moteur de calculs financiers | ~400 |
| `types.ts` | Définitions TypeScript | ~50 |

---

## 🎨 GUIDE DES SECTIONS

### 1️⃣ **SECTION INACTION** (Rouge)

**Effet** : Créer l'urgence en montrant le coût de l'inaction

**Contenu** :
- 💸 Facture perdue en 1 an sans solaire
- ⚡ Économies ratées en 1 an
- ⏱️ Compteur en temps réel (argent perdu par seconde)

**Personnalisation** :
```tsx
// Modifier le taux de perte par seconde
const lossPerSecond = calculationResult.costOfInactionPerSecond;

// Changer les couleurs
className="bg-[#2a0505]"  // Rouge foncé
className="text-red-500"   // Texte rouge
```

---

### 2️⃣ **SÉLECTEUR DE PROJECTION** (10-25 ans)

**Effet** : Permettre de visualiser différents horizons d'investissement

**Contenu** :
- Boutons 10, 15, 20, 25 ans
- Change tous les graphiques en temps réel

**Personnalisation** :
```tsx
// Modifier les années disponibles
{[10, 15, 20, 25].map(y => ...)}

// Ajouter 30 ans par exemple
{[10, 15, 20, 25, 30].map(y => ...)}
```

---

### 3️⃣ **AUTONOMIE ÉNERGÉTIQUE** (Vert)

**Effet** : Montrer le % d'indépendance énergétique

**Contenu** :
- 🔋 Cercle de progression (style Apple Watch)
- Pourcentage d'autonomie
- Gain total projeté

**Calcul** :
```typescript
savingsRatePercent = (yearlySavings / yearlyBillWithoutSolar) * 100
```

**Personnalisation** :
```tsx
// Changer la couleur du cercle
stroke="#34d399"  // Émeraude (actuel)
stroke="#3b82f6"  // Bleu
stroke="#f59e0b"  // Orange
```

---

### 4️⃣ **RÉPARTITION ÉNERGIE** (Activity Rings)

**Effet** : Visualiser la répartition autoconsommation/vente

**Contenu** :
- 🟠 Cercle externe : Autoconsommation (70%)
- 🟣 Cercle interne : Vente surplus (30%)
- Total production au centre

**Personnalisation** :
```tsx
// Modifier le taux d'autoconsommation
setSelfConsumptionRate(80)  // 80% au lieu de 70%

// Changer les couleurs
stroke="#f59e0b"  // Autoconso (orange actuel)
stroke="#8b5cf6"  // Surplus (violet actuel)
```

---

### 5️⃣ **FINANCEMENT VS CASH**

**Effet** : Comparer les deux modes de paiement

**Contenu** :
- 💳 Carte Financement (point mort, ROI, gain)
- 💰 Carte Cash (meilleur ROI, point mort plus court)
- ⚖️ Verdict du conseiller

**Calculs clés** :
```typescript
// Point mort financement
breakEvenPoint = année où cumulativeSavings > 0

// ROI annuel
roiPercentage = (totalSavings / installCost / years) * 100
```

---

### 6️⃣ **OÙ SERA VOTRE ARGENT ?**

**Effet** : Projection 5, 10, 20 ans avec tooltips explicatifs

**Contenu** :
- 💰 Avec Solaire (Crédit) : Gain net cumulé
- 💵 Avec Solaire (Cash) : Gain net cumulé
- 🔥 Sans rien faire : Argent perdu définitivement

**Tooltips** :
Survolez le `?` pour voir le détail des calculs

**Personnalisation** :
```tsx
// Modifier les années affichées
const yearsToDisplay = [5, 10, 20];  // Actuel
const yearsToDisplay = [3, 7, 15, 25];  // Exemple
```

---

### 7️⃣ **COMPARAISON AVEC VOS AUTRES OPTIONS**

**Effet** : Montrer que le solaire bat tous les placements classiques

**Contenu** :
- 🏦 Livret A (2.7%) + Gain sur 20 ans
- 🛡️ Assurance Vie (3.5%) + Gain sur 20 ans
- 🏠 SCPI (4.5%) + Gain sur 20 ans
- ☀️ Solaire (calculé) + Gain réel sur 20 ans

**Calculs intérêts composés** :
```typescript
// Livret A
gainLivretA = installCost * Math.pow(1.027, 20) - installCost

// Assurance Vie
gainAssuranceVie = installCost * Math.pow(1.035, 20) - installCost

// SCPI
gainSCPI = installCost * Math.pow(1.045, 20) - installCost

// Solaire (réel)
gainSolaire = calculationResult.totalSavingsProjected
```

**Personnalisation** :
```tsx
// Modifier les taux
<div>2.7%</div>  // Livret A
<div>3.5%</div>  // Assurance Vie
<div>4.5%</div>  // SCPI

// Formules dans le code
Math.pow(1.027, projectionYears)  // 2.7%
Math.pow(1.035, projectionYears)  // 3.5%
Math.pow(1.045, projectionYears)  // 4.5%
```

---

### 8️⃣ **CAPITAL PATRIMONIAL**

**Effet** : Afficher le gain total comme un patrimoine

**Contenu** :
- 💼 Montant total gagné (gros chiffre)
- 📊 Métriques : ROI, Gain moyen/an, Point mort
- 💡 Explication du calcul (formule détaillée)

**Cartes latérales** :
- 🏦 **Équivalent bancaire** : Capital nécessaire en Livret A pour générer le même revenu
- 📈 **Effort d'épargne** : Différence mensuelle année 1

---

### 9️⃣ **BILAN TOTAL SUR 20 ANS**

**Effet** : Visualiser la différence de dépenses avec/sans solaire

**Contenu** :
- 🔴 Barre rouge : Argent dépensé sans solaire (100%)
- 🔵 Barre bleue : Argent dépensé avec solaire (~50%)
- 💚 Différence = Gain net

**Toggle** : Financement / Cash

**Personnalisation** :
```tsx
// Calcul des largeurs de barres
width: `${(totalSpendSolar / totalSpendNoSolar) * 100}%`
```

---

### 🔟 **LOCATAIRE VS PROPRIÉTAIRE**

**Effet** : Contraste visuel fort (rouge vs bleu)

**Contenu** :
- ❌ Locataire énergétique : Dépendance, inflation, perte
- ✅ Propriétaire producteur : Indépendance, patrimoine, liberté

---

### 1️⃣1️⃣ **GARANTIES & SÉCURITÉ**

**Effet** : Rassurer sur la fiabilité de l'installation

**Toggle** : Performance (TVA 20%) / Essentielle (TVA 5.5%)

**Contenu mode Performance** :
- ☀️ Panneaux : À VIE
- ⚡ Onduleurs : À VIE
- 🔧 Structure : À VIE
- 🛡️ Matériel : À VIE

**Contenu mode Essentielle** :
- ☀️ Panneaux : 25 ANS (🇫🇷 Français)
- ⚡ Onduleurs : 25 ANS
- 🔧 Structure : 10 ANS
- 🛡️ Matériel : 25 ANS

**Autopilote & Afficheur** :
- 🤖 Surveillance IA 24/7
- 📱 Afficheur temps réel (kW, €, consommation)

---

### 1️⃣2️⃣ **STRUCTURE DU BUDGET**

**Effet** : Décomposer visuellement le budget mensuel

**Contenu** :
- 🔴 Barre rouge : Facture actuelle (100%)
- 🔵 Barre bleue/orange : Crédit + Reste facture

---

### 1️⃣3️⃣ **ÉCONOMIES ANNUELLES** (BarChart)

**Effet** : Visualiser le cashflow année par année

**Contenu** :
- 🔴 Barres rouges : Années d'effort (pendant le crédit)
- 🟢 Barres vertes : Années de profit (après le crédit)

**Toggle** : Financement / Cash

**Tooltip personnalisé** :
- Année N
- Montant ± X €
- "Effort d'investissement" ou "Rentabilité pure"

---

### 1️⃣4️⃣ **LE GOUFFRE FINANCIER** (AreaChart)

**Effet** : Montrer la divergence exponentielle des dépenses

**Contenu** :
- 🔴 Courbe rouge : Dépenses sans solaire (exponentielle)
- 🔵 Courbe bleue : Dépenses avec solaire (plateau après crédit)

**Slider inflation** : 0% → 10%

**Toggle** : Financement / Cash

**Effet de l'inflation** :
- 0% = Ligne droite
- 5% = Courbe exponentielle
- 10% = Explosion des coûts

---

### 1️⃣5️⃣ **PLAN DE FINANCEMENT DÉTAILLÉ** (Tableau)

**Effet** : Tableau année par année avec tous les chiffres

**Toggle 1** : Financement / Cash
**Toggle 2** : Annuel / Mensuel

**Colonnes** :
- Année
- Sans Solaire (facture EDF)
- Crédit
- Reste Facture
- Total Avec Solaire
- Effort (différence)
- Trésorerie Cumulée

**Ligne Année 0** : Apport initial

---

### 1️⃣6️⃣ **IA & CALL TO ACTION**

**Effet** : Discours motivationnel + bouton d'action

**Contenu** :
- 🤖 Texte IA percutant
- ✅ Bouton CTA "JE VEUX MA PROPRE CENTRALE"

---

## 🧮 CALCULS FINANCIERS

### Moteur de calcul (`finance.ts`)

#### Formule principale
```typescript
// Pour chaque année :
const edfBillWithoutSolar = baseElectricityBill * Math.pow(1 + inflationRate/100, yearIndex);
const edfBillWithSolar = edfBillWithoutSolar * (1 - selfConsumptionRate/100);
const creditPayment = creditActive ? monthlyCredit * 12 : 0;
const totalSpendThisYear = creditPayment + edfBillWithSolar;
const savingsThisYear = edfBillWithoutSolar - totalSpendThisYear;
const cumulativeSavings += savingsThisYear;
```

#### Calcul du point mort
```typescript
breakEvenPoint = première année où cumulativeSavings > 0
```

#### Calcul du ROI
```typescript
roiPercentage = (totalSavings / installCost / projectionYears) * 100
```

#### Intérêts composés
```typescript
finalCapital = capitalInitial * Math.pow(1 + tauxAnnuel, nombreAnnées)
gain = finalCapital - capitalInitial
```

---

## 🎨 PERSONNALISATION

### Modifier les couleurs
```tsx
// Palette actuelle
const colors = {
  red: '#ef4444',      // Danger / Sans solaire
  blue: '#3b82f6',     // Financement
  emerald: '#10b981',  // Cash / Gains
  orange: '#f59e0b',   // Autoconsommation
  purple: '#8b5cf6',   // Surplus / Comparaisons
  slate: '#64748b'     // Textes secondaires
}
```

### Modifier les paramètres par défaut

**Fichier : `ResultsDashboard.tsx`**
```tsx
const [inflationRate, setInflationRate] = useState<number>(5);  // 5% par défaut
const [projectionYears, setProjectionYears] = useState(20);     // 20 ans
const [electricityPrice, setElectricityPrice] = useState<number>(0.25);  // 0.25€/kWh
const [yearlyProduction, setYearlyProduction] = useState<number>(7000);  // 7000 kWh
const [selfConsumptionRate, setSelfConsumptionRate] = useState<number>(70);  // 70%
const [installCost, setInstallCost] = useState<number>(18799);  // 18799€
```

### Modifier les taux de comparaison

**Section "Comparaison avec vos autres options"**
```tsx
// Livret A
Math.pow(1.027, projectionYears)  // 2.7% → Modifier ici

// Assurance Vie
Math.pow(1.035, projectionYears)  // 3.5% → Modifier ici

// SCPI
Math.pow(1.045, projectionYears)  // 4.5% → Modifier ici
```

### Ajouter une nouvelle section
```tsx
{/* NOUVELLE SECTION */}
<div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 mt-8">
    <div className="flex items-center gap-3 mb-8">
        <IconName className="text-color w-6 h-6" />
        <h2 className="text-2xl font-black text-white uppercase">TITRE</h2>
    </div>
    
    {/* Contenu ici */}
</div>
```

---

## 🔧 MAINTENANCE

### Mettre à jour les dépendances
```bash
# Vérifier les mises à jour
npm outdated

# Mettre à jour toutes les dépendances
npm update

# Mettre à jour une dépendance spécifique
npm install recharts@latest
```

### Ajouter une nouvelle dépendance
```bash
npm install nom-package
```

### Modifier le build

**Fichier : `vite.config.ts`**
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/',  // Modifier si sous-dossier
  build: {
    outDir: 'dist',
    sourcemap: false  // true pour debug
  }
})
```

---

## 🐛 DÉPANNAGE

### Problème : Build échoue sur Vercel

**Solution** :
```bash
# Vérifier en local
npm run build

# Si erreur TypeScript
npm run build -- --noEmit false
```

### Problème : Graphiques ne s'affichent pas

**Solution** :
Les graphiques Recharts ont besoin d'une `key` unique quand on toggle entre modes.
```tsx
<ResponsiveContainer key={modeState}>
  <BarChart data={data}>
    ...
  </BarChart>
</ResponsiveContainer>
```

### Problème : Calculs incorrects

**Vérifier** :
1. `finance.ts` : Formules d'intérêts composés
2. `ResultsDashboard.tsx` : `useMemo` dependencies
3. Console : `useEffect` de validation

### Problème : Styles Tailwind ne s'appliquent pas

**Solution** :
```bash
# Vérifier que Tailwind est bien configuré
npm install -D tailwindcss postcss autoprefixer

# Vérifier src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📊 MÉTRIQUES & PERFORMANCE

### Lighthouse Score (Objectif)
- 🟢 Performance : 95+
- 🟢 Accessibility : 90+
- 🟢 Best Practices : 100
- 🟢 SEO : 90+

### Bundle Size
- Total : ~350 KB (gzipped)
- Recharts : ~150 KB
- React : ~120 KB
- App : ~80 KB

---

## 📝 CHANGELOG

### Version 2.0 (Actuelle)
- ✅ Conversion Vite + TypeScript
- ✅ Déploiement Vercel
- ✅ Graphiques circulaires fixes (Activity Rings)
- ✅ Tooltips personnalisés BarChart
- ✅ Cartes "Gain sur 20 ans" (comparaison placements)
- ✅ Tooltips explicatifs section "Où sera votre argent"
- ✅ Validation automatique console
- ✅ Fix proportions graphique "Bilan Total"

### Version 1.0
- Interface initiale avec import maps
- Calculs financiers de base
- Graphiques Recharts

---

## 👥 CONTRIBUTION

### Workflow Git
```bash
# 1. Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire des commits
git add .
git commit -m "Add: nouvelle fonctionnalité"

# 3. Push
git push origin feature/nouvelle-fonctionnalite

# 4. Créer une Pull Request sur GitHub
```

### Convention de commits

- `Add:` Nouvelle fonctionnalité
- `Fix:` Correction de bug
- `Update:` Mise à jour
- `Refactor:` Refactorisation
- `Docs:` Documentation

---

## 📞 SUPPORT

### Besoin d'aide ?

- 📧 Email : support@nexus-core.com
- 💬 Discord : [Lien Discord]
- 📚 Documentation : [Lien Docs]

---

## 📜 LICENCE

MIT License - Libre d'utilisation commerciale

---

## 🎯 ROADMAP

### À venir
- [ ] Export PDF des résultats
- [ ] Comparaison multi-scénarios (côte à côte)
- [ ] Intégration API tarifs EDF en temps réel
- [ ] Mode sombre/clair
- [ ] Version mobile optimisée
- [ ] Sauvegarde des simulations (localStorage)
- [ ] Partage de simulation (URL unique)

---

**Créé avec ❤️ pour EDF Solutions Solaires**
