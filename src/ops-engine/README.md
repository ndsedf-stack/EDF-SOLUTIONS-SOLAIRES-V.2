# OPS DECISION ENGINE

## Purpose
This engine governs internal operational decisions.
It does NOT influence client decisions.
It protects execution integrity.

## Why it exists
UI-based rules are fragile.
This engine centralizes:
- risk detection
- war room escalation
- operational locking
- auditability

## What it does
- Computes cancellation risk
- Detects silent / critical dossiers
- Decides WAR ROOM escalation
- Locks actions when necessary

## What it does NOT do
- No persuasion
- No client-facing logic
- No autonomous action

## Architecture Principle
ENGINE decides.
UI displays.
Humans act.

## Auditability
All thresholds are deterministic.
All decisions are explainable.
No black-box AI is involved.

## Future extensions
- AI anomaly detection (read-only)
- CEO reporting
- Commercial performance analytics

## Scoring System (Intelligence Passive)

### 1. Risk Ops Score (0-100)
Probabilité opérationnelle de perte.
- **Facteurs +** : SRU dépassé (+60), Retard acompte (+40), Silence (+25).
- **Facteurs -** : Acompte reçu (-40), Activité récente (-15).
- **Seuils** : ≥70 (WAR_ROOM), 40-69 (PRIORITY).

### 2. Inertia Score (0-100)
Temps mort / absence de mouvement.
- **Facteurs** : Silence >14j (+50), Silence 7-14j (+35).
- **Seuils** : ≥60 (CRITIQUE), 35-59 (INERTIE).

### 3. Health Score (0-100)
Qualité globale.
- **Formule** : `100 - (RISK * 0.6) - (INERTIA * 0.4)`
- **Seuils** : ≥70 (SAIN), <25 (TOXIQUE).
