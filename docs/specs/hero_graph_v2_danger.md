# 🩸 HERO GRAPH V2 : RISK EXPOSURE OVER TIME
**Statut :** LOCKÉ (30/01/2026)
**Type :** Danger Graph (Pas Analytics)
**Philosophie :** "Le succès est un bruit de fond, le danger est le signal."

---

## 1. CONCEPT CENTRAL
Ce graphique ne répond qu'à une seule question :
**"Quelle part de mon business est ACTIVEMENT en train de m'échapper ?"**

Il ne doit **JAMAIS** rassurer. Il doit alerter.
Si la situation est critique, l'écran doit être "insupportable" visuellement.

---

## 2. STRUCTURE VISUELLE (LAYER PAR LAYER)

### 🟥 LAYER 1 : LE DANGER (Background Dominant)
*   **Donnée :** `cancellable` (CA Annulable).
*   **Forme :** Surface pleine (`AreaClosed`).
*   **Ancrage :** Base (`y=0`).
*   **Couleur :** Rouge (`#FF4757`).
*   **Opacité :** Forte, lourde. Doit peser sur l'écran. 
    *   *Stable :* ~20%
    *   *Critique :* ~60% (Saturation visuelle).
*   **Rôle :** Protagoniste absolu.

### 🟧 LAYER 2 : L'INCERTITUDE (Contexte)
*   **Donnée :** `waiting` (CA en Attente) [Positionné au-dessus du Danger].
*   **Forme :** Bande (`AreaClosed` ou `AreaStack` manuel).
*   **Géométrie :** De `y=cancellable` à `y=cancellable + waiting` (Visuellement empilé sur le rouge, mais distinct).
*   **Couleur :** Orange désaturé / Gris chaud (`#FF9F40` très faible).
*   **Opacité :** Faible, fantomatique. C'est du "brouillard de guerre".
*   **Rôle :** Expliquer la latence, pas l'urgence.

### 🟩 LAYER 3 : LA RÉFÉRENCE (Kale)
*   **Donnée :** `secured` (CA Sécurisé).
*   **Forme :** LIGNE SIMPLE (`LinePath`).
*   **Géométrie :** Indépendant. Ne s'empile pas.
*   **Couleur :** Vert froid (`#00E676`).
*   **Style :** Fine, chirurgicale (2px). Pas d'aire.
*   **Rôle :** Ligne de flottaison. Si Rouge > Vert, c'est la panique.

---

## 3. RÈGLES D'AXES & ÉCHELLES
*   **Axe X (Temps)** : 30 jours glissants (lissé).
*   **Axe Y (Montant)** :
    *   **Zéro Forcé** : `domain: [0, max]`.
    *   **Max** : `max(secured, cancellable + waiting) * 1.1` (Headroom 10%).
    *   **Interdiction** : Jamais de double échelle. Un euro est un euro.

---

## 4. COMPORTEMENT SELON L'ÉTAT GLOBALE

| État | Ambiance | Opacité Rouge | Message |
| :--- | :--- | :--- | :--- |
| **🟢 STABLE** | "Contrôle" | Faible (~15%) | Le vert (Ligne) survole le rouge (Surface basse). |
| **🟠 TENSION** | "Attention" | Moyenne (~35%) | Le rouge monte, commence à "manger" l'espace. |
| **🔴 CRITIQUE** | "WAR ROOM" | **Lourde (~65%)** | Le rouge écrase tout. La ligne verte semble noyée. |

---

## 5. INTERDITS FORMELS (QA REJECTION)
❌ **Pas de Stacked Area Globale** (Le vert ne s'empile pas sur le reste).
❌ **Pas de Tooltip au repos**.
❌ **Pas de Légende flottante** (L'image doit se suffire à elle-même).
❌ **Pas de KPI cards** sous le graphe immédiat (Isolation cognitive).

---

## 6. IMPLÉMENTATION VISX PRÉVUE
```tsx
// Pseudo-code structurel
<Group>
  {/* 1. DANGER (Fondation) */}
  <AreaClosed data={data} y={d => scale(d.cancellable)} fill="red" />
  
  {/* 2. INCERTITUDE (Brouillard) */}
  <Area data={data} y0={d => scale(d.cancellable)} y1={d => scale(d.cancellable + d.waiting)} fill="orange_grey" />
  
  {/* 3. SÉCURITÉ (Filigrane) */}
  <LinePath data={data} y={d => scale(d.secured)} stroke="green" />
</Group>
```
