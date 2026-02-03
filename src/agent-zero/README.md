# Agent Zero — Decision Engine

## Rôle
Agent Zero ne vend pas.
Il empêche une mauvaise décision.

## Entrées
- Signaux utilisateur (navigation, fatigue, engagement)
- État du dossier
- Avancement cognitif

## Sorties
- permissions (ce qui est autorisé)
- locks (ce qui est interdit)
- nudges (micro-ajustements)
- audit (preuve)

## Principe clé
La décision n’est jamais forcée.
Elle devient simplement la seule cohérente.

## Distinction Ops (Important)
Ce module est le **Cerveau Client** (Front de vente).
Il ne gère PAS :
- La War Room
- Les risques d'annulation post-signature
- La gouvernance interne
👉 Voir `src/ops-engine/` pour la gouvernance Ops.
