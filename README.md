# EDF DASHBOARD TEST - OPS AGENT

## Overview
This project integrates **Agent Zero** decision logic with a React frontend (`EDF-DASHBOARD-TEST`). It features an advanced **Ops Agent** layer designed to audit, secure, and certify business data visualization.

## Key Features

### 1. Agent Zero Core
- **Decision Engine**: Native Python implementation of business rules.
- **Strict JSON Contract**: No hallucinations, pure logic.
- **Profile Detection**: Adapts UI to user psychology (Senior, Banker, etc.).

### 2. Ops Agent (Industrial Governance)
- **Data Integrity**: Checks for discrepancies between DB and UI.
- **UX Audit**: Scores visualization quality (readability, density).
- **Anti-Copy**: System fingerprinting and license guards.

### 3. Industrial Governance (Phase 4 & 5)
- **Run Audit Button**: Manual trigger for full system scan.
- **PDF Reports**: downloadable, official reports with detailed issues.
- **Time Travel**: Tracks audit history in Supabase.
- **Regression Blocking**: CI/CD guard prevents deploying regressed UX scores.
- **Exhaustive Mode**: System crashes if ANY visible component lacks an audit module. 100% Coverage guaranteed.
- **Consulting-Grade Intelligence**: Audit reports provide structural remediations and approved UX patterns (Pattern-Matching vs Design Flaws).

## Setup

### Prerequisites
- Node.js 18+
- Python 3.11+ (for Agent Zero)
- Supabase Account (for History)

### Installation
```bash
npm install
npm run dev
```

### Environment Variables
See `.env.example`.
- `VITE_SUPABASE_URL`: Your Supabase URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Key.
- `OPS_FINGERPRINT`: System unique ID.

## Usage

### Running an Audit
1. Navigate to the **Cockpit**.
2. Click **Run Ops & UX Audit** in the header.
3. Wait for the scan to complete.
4. Download the PDF report.

### Certification
A "Certified" badge appears only if:
- Global Score >= 80/100
- 0 Critical Data Breaches
- 0 War Room Critical Alerts

## Architecture
- `src/ops-core/`: Security & Licensing.
- `src/ops-agent/`: Audit Logic & PDF Generation.
- `src/ops-ux-audit/`: UX Rules & Charts Audits.
- `src/components/territories/Cockpit/`: UI Integration.

## 🏰 Architecture Sentinel
Le projet est désormais doté d’une protection multicouche :
- **Storage Layer** : Utilisation du `danger_score` pour la traçabilité des risques.
- **Security Layer** : Tokens UUID v4 et vérification d'expiration SQL native.
- **Compliance Layer** : Footers légaux et scripts de purge RGPD.

## ⚖️ Compliance & Légal
Tous les documents de conformité (RGPD, Mentions Légales, CGU) sont centralisés dans le dossier `docs/COMPLIANCE/`.
- [Politique de Confidentialité](./docs/COMPLIANCE/PRIVACY_POLICY.md)
- [Mentions Légales](./docs/COMPLIANCE/LEGAL_MENTIONS.md)
- [CGU](./docs/COMPLIANCE/CGU.md)
