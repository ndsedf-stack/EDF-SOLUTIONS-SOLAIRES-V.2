# OPS CORE — SECURITY LAYER
**Statut :** CRITIQUE · VERROUILLAGE · INTÉGRITÉ

---

## 🛡️ Le Concept
Ce module (`src/ops-core/`) est la "boîte noire" de sécurité du système.
Il garantit que le code ne peut tourner que sur l'environnement autorisé.

## 🔑 Composants

### 1. System Fingerprint (`fingerprint.ts`)
Génère un hash SHA-256 unique basé sur :
- Le domaine d'exécution.
- L'URL de la base de données Supabase.
- Un sel secret.

### 2. License Guard (`license.guard.ts`)
Compare le fingerprint calculé à celui autorisé dans les variables d'environnement (`OPS_FINGERPRINT`).
Si divergence -> `throw new Error("LICENSE_VIOLATION")`.
Le système crashe intentionnellement.

### 3. Integrity Check (`integrity.check.ts`)
Vérifie la somme de contrôle des fichiers critiques du moteur.
Si un développeur tente de commenter la vérification de licence -> `throw new Error("ENGINE_TAMPERED")`.

## 🚀 Utilisation
Ces gardes sont appelés au démarrage du `Cockpit` et des fonctions Serverless.
Aucune UI ne s'affiche si la sécurité n'est pas validée.

---
*Ce module protège la propriété intellectuelle du système Ops Agent.*
