# 🎨 UI / VISX ARCHITECTURE V2
**Dernière mise à jour :** 30/01/2026
**Statut :** CANONIQUE (Non Négociable)

Ce document décrit l'architecture frontend stricte pour la data-visualisation et les écrans de pilotage du Dashboard.

---

## 🏛️ PHILOSOPHIE "TRUTHFUL CHART" (C-LEVEL)

L'objectif n'est pas de faire joli. L'objectif est de **dire la vérité** brutalement.
Un graphique dans ce système doit :
1.  **Commander l'écran** : Il est l'élément d'autorité, pas une décoration.
2.  **Ignorer le bruit** : Pas de légendes parasites, pas de tooltip au repos, pas de "chartjunk".
3.  **Être mathématiquement pur** :
    *   Y commence toujours à 0.
    *   Pas d'interpolation lissante (sauf curveMonotoneX maîtrisée).
    *   Pas de double axe douteux.
    *   Pas de stack implicite.

---

## 🧱 ARCHITECTURE À 3 COUCHES (STRICTE)

Pour garantir la maintenance et la cohérence, tout graphique "Hero" doit respecter cette structure :

### 1️⃣ LE WRAPPER (`HeroChartVisx`)
**Responsabilité :** Layout, Sizing, Silence.
*   Gère le `ParentSize` (Responsive).
*   Impose le padding et les marges externes.
*   Gère le Titre et le Sous-titre.
*   **Interdit** à l'enfant de déborder.

```tsx
<HeroChartVisx title="Exposition Financière">
  {({ width, height }) => (
    <FinancialRiskVisx width={width} height={height} ... />
  )}
</HeroChartVisx>
```

### 2️⃣ LE MOTEUR GRAPHIQUE (`xxxVisx`)
**Responsabilité :** Dessiner des pixels.
*   **Apatride** : Ne connaît rien de l'état global de l'app (sauf props).
*   **Pure UI** : Pas de logique métier complexe, pas de fetch.
*   **Focus** : Utilise `AreaStack`, `LinePath`, `BarGroup` de Visx.
*   **Props** : Reçoit `width`, `height`, `data`, `riskLevel` (pour la couleur).

### 3️⃣ L'INTERACTION (`Tooltip` & `Legend`)
**Responsabilité :** Détail sur demande.
*   **Légende** : Doit être **externe** ou en overlay statique discret. Jamais superposée aux données.
*   **Tooltip** :
    *   **Invisible au repos**.
    *   **Latéral** : Ne doit jamais masquer le point consulté.
    *   **Stable** : "Snap" magnétique sur les données (pas de suivi souris erratique).

---

## 👁️ HIÉRARCHIE VISUELLE "BRUTALE"

Chaque écran de pilotage (Overview, Drift, Pipeline) suit cette hiérarchie :

1.  **🔴 ZONE 1 : TENSION (Haut)**
    *   Bannière pleine largeur.
    *   Sert de "Feu Tricolore" (Vert/Orange/Rouge).
    *   Contient le CTA critique ("War Room").

2.  **🧠 ZONE 2 : HERO GRAPH (Centre)**
    *   Occupe 60-70% de l'espace vertical.
    *   Aucune distraction autour.
    *   C'est l'ancre cognitive de la page.

3.  **📊 ZONE 3 : SYNTHÈSE (Bas)**
    *   KPIs en grille horizontale.
    *   Lecture rapide.
    *   Confirment ce que le graphe montre.

---

## 🛠️ RÈGLES DE DÉVELOPPEMENT (DEV GUIDELINES)

1.  **Zéro Recharts** : La librairie est bannie. Tout nouveau graphe est en Visx.
2.  **Zéro Magie** : Si une échelle est tordue, c'est un bug.
3.  **Code Scindé** :
    *   `src/components/charts/hero/` : Les moteurs graphiques.
    *   `src/components/charts/shared/` : Les wrappers et composants UI (Tooltip, Legend).
4.  **Honnêteté du Rouge** : La couleur rouge est réservée au danger critique. Son opacité doit varier selon l'intensité du risque (`RiskLevel`).

---

*Tout écart à cette architecture doit être justifié par une raison impérieuse de survie du business.*
