# 🗺️ INDEX DE LA DOCUMENTATION — AUTOPILOTE SOLAIRE

> **Point d'entrée unique** pour comprendre, maintenir et évoluer le système.
> Dernière mise à jour : Janvier 2026

---

## 🏗️ Architecture & Système (Niveau Macro)

Ces documents expliquent "Comment ça marche" dans son ensemble.

| Document | Rôle & Contenu | Public |
| :--- | :--- | :--- |
| **[`docs/ARCHITECTURE_COMPLETE.md`](./ARCHITECTURE_COMPLETE.md)** | **BIBLE TECHNIQUE**. Diagramme des flux complets, liste des tables Supabase, détail des algorithmes critiques (Danger Score, War Room) et checklists d'audit. | Tech Lead, Auditeur |
| [`docs/system.architecture.md`](./system.architecture.md) | Vision haut niveau des interactions entre ResultDashboard, Brain et GuestView. | Dev, PM |
| [`docs/architecture.v2.md`](./architecture.v2.md) | Focus spécifique sur la V2 (évolutions architecturales précédentes). | Dev (Historique) |
| [`docs/brain.logic.md`](./brain.logic.md) | Explication détaillée de la logique "Brain" (moteur de décision). | Backend Dev |
| [`docs/ui.visx_architecture.md`](./ui.visx_architecture.md) | Guide des choix graphiques (Visx), palette de couleurs et philosophie "Brutaliste / Truthful Charts". | Frontend Dev, Designer |

---

## ⚙️ Documentation Technique (Modules & Composants)

Documentation rapprochée du code pour l'implémentation.

| Document | Module / Composant | Fonction |
| :--- | :--- | :--- |
| **[`src/brain/README.md`](../src/brain/README.md)** | **BRAIN & ENGINE**. Guide du développeur pour le coeur du réacteur : hook `useSystemBrain`, `Engine.ts`, types et ingestion des données. |
| **[`src/components/ResultDashboard/README.md`](../src/components/ResultDashboard/README.md)** | **RESULT DASHBOARD**. Guide terrain : comment utiliser l'écran de vente, wording imposé, gestion des interactions client. |
| **[`src/components/GuestView/README.md`](../src/components/GuestView/README.md)** | **GUEST VIEW**. Spécifications de la vue client (post-rdv) : tracking events, RGPD, expiration des liens. |
| [`docs/backend.supabase.md`](./backend.supabase.md) | Structure de la base de données, RLS policies, Triggers. | Backend Dev |
| [`README SUPABASE RESEND.md`](../README%20SUPABASE%20RESEND.md) | Configuration de l'envoi d'emails (Resend) et intégration Supabase. | DevOps |
| [`README COACH.md`](../README%20COACH.md) | Documentation du module Coach (assistante virtuelle). | Frontend Dev |

---

## 💼 Business & Opérationnel (Terrain)

Documents orientés métier, vente et stratégie.

| Document | Sujet | Utilité |
| :--- | :--- | :--- |
| **[`docs/bible.integrale.md`](./bible.integrale.md)** | **DOCUMENT DE RÉFÉRENCE MÉTIER**. "La Bible". Contient toute la doctrine de vente, la psychologie client et les scripts. | Sales, Manager |
| [`docs/manifesto.md`](./manifesto.md) | Philosophie du produit "Anti-Entropie". Pourquoi on a construit ça. | Tout le monde |
| **[`docs/KPIS.md`](./KPIS.md)** | **KPIs & MONITORING**. Définitions mathématiques des indicateurs clés (Closing Net, Annulations J+7, CA Sécurisé). | Analyste, C-Level |
| [`docs/workflow.ops.md`](./workflow.ops.md) | Procédures opérationnelles standards (SOP) pour la War Room et le suivi des dossiers. | Ops Manager |
| [`docs/cockpit.contract.md`](./cockpit.contract.md) | Détail des éléments contractuels affichés dans le Cockpit. | Legal, Sales |

---

## 🔧 Maintenance & Patching

Suivi des évolutions et correctifs.

| Document | Description |
| :--- | :--- |
| **[`docs/PATCH_NOTES_AND_ACCEPTANCE.md`](./PATCH_NOTES_AND_ACCEPTANCE.md)** | **DERNIER PATCH (P0)**. Détail des correctifs critiques : chargement parallèle, logs sécurisés, UUID fallback. Checklist de validation. |
| [`docs/setup.md`](./setup.md) | Installation initiale du projet (dev environment). |
| [`docs/glossary.md`](./glossary.md) | Dictionnaire des termes métier (ex: "Danger Score", "War Room", "Drift"). |

---

## ⚠️ Composants Clés (Vérification Documentation)

État des lieux de la documentation des composants majeurs :

*   ✅ **Brain / Engine** : Couvert par `src/brain/README.md` et `docs/ARCHITECTURE_COMPLETE.md`.
*   ✅ **ResultDashboard (Sales)** : Couvert par `src/components/ResultDashboard/README.md`.
*   ✅ **GuestView (Client)** : Couvert par `src/components/GuestView/README.md`.
*   ✅ **Cockpit / War Room / Pilotage** : Couverts par `docs/bible.integrale.md` (fonctionnel) et `docs/ARCHITECTURE_COMPLETE.md` (technique).
*   ✅ **Charts (Visx)** : Couvert par `docs/ui.visx_architecture.md`.

---

> **Pour toute question non couverte ici :**
> Se référer en priorité à **`docs/ARCHITECTURE_COMPLETE.md`** pour la technique et **`docs/bible.integrale.md`** pour le métier.
