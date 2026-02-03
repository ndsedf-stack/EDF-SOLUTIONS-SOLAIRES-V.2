# OPS UX AUDIT — DESIGN INTEGRITY LAYER

**Mission :** Garantir que chaque pixel affiché à l'écran sert la décision, et ne la biaise pas.
**Philosophie :** "L'esthétique est secondaire. La vérité est absolue."

---

## 🏗️ Architecture (`src/ops-ux-audit/`)

### `engine/` (Le Cerveau)
- `uxAudit.engine.ts` : Orchestrateur global. Récupère les scores unitaires et décide de la conformité globale.
- `uxAudit.types.ts` : Le langage de l'audit (Severity, Issues, Scores).

### `charts/` (Les Spécialistes)
Chaque fichier est un auditeur expert d'un type de graphique précis :
- `financialRisk.audit.ts` : Vérifie la lisibilité du CA sécurisé vs exposé.
- `projectionCA.audit.ts` : S'assure que les scénarios pessimistes sont visibles.
- `riskMap.audit.ts` : Vérifie que la zone de danger est claire.
- `clientDrift.audit.ts` : Valide la présence du marqueur J+7.
- `behaviorTimeline.audit.ts` : Chasse le bruit visuel (trop de lignes).

### `cards/` (Les KPI)
- `kpiCards.audit.ts` : Vérifie qu'on ne noie pas le décideur sous trop de chiffres.

### `truth/` (Le Firewall)
- `dataVsRender.audit.ts` : Compare mathématiquement la donnée brute (Supabase) et la donnée affichée (Visx).
- **Règle d'Or** : Si `Rendered < Raw` => Blocage immédiat.

---

## 🛡️ Règles Fondamentales

1.  **L'Agent ne designe pas.** Il audite. Il ne dit pas "Fais du bleu", il dit "Ton contraste est insuffisant".
2.  **La Décision prime.** Un graphique "joli" mais illisible aura un score de 0.
3.  **Tolérance Zéro sur la Data.** Une erreur d'échelle ou de clipping est considérée comme un mensonge (CRITICAL).

---
*Ce module est le garant moral du dashboard.*
