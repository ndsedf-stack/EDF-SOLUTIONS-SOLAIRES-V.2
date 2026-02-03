# 📊 Results Dashboard : La Bible des Contenus

Ce document recense l'intégralité des **textes dynamiques**, **séquences de modules** (Phases) et **logiques d'affichage** pilotés par le *ResultsDashboard*.

---

## 1. 🚦 LOGIQUE D'ORCHESTRATION (LE JUGE & LE COACH)

Le Dashboard ne présente pas les mêmes modules ni les mêmes textes selon le profil détecté (`senior`, `banquier`, `standard`).

### 1.1 Le "Juge" (Audit Shield)
*   **Fonction :** `handleModuleChange(targetModule)`
*   **Rôle :** Vérifie si le commercial suit l'ordre imposé par l'IA (Agent Zero).
*   **Sanction :** `-15 points` de conformité si un module est ouvert hors séquence.

### 1.2 Le "Coach" (Phases)
Chaque profil possède une séquence par défaut (surchargée par Agent Zero si actif).

---

## 2. 📋 SÉQUENCES PAR DÉFAUT (PHASES)

### 👴 SENIOR (Focus : Sécurité, Transmission, Simplicité)
1.  **Cadrage sécurité** : "Avant les chiffres, parlons sécurité" (Cadre EDF institutionnel).
2.  **Garanties & Sécurité** (`garanties`) : "Ce qui protège vraiment votre famille" (Pointer 'À VIE' + État).
3.  **Situation actuelle** (`repartition`) : "Aujourd’hui vous payez et vous ne possédez rien".
4.  **Projection 20 ans** (`projection`) : "Dans 20 ans : actif vs rien".
5.  **Taux** (`taux`) : "On vérifie, pas on force".
6.  **Décision** (`decision`) : "C’est oui / c’est non".

### 💼 BANQUIER (Focus : ROI, Cash-Flow, Tableau Amortissement)
1.  **Cadre d'analyse** : "Ce n'est pas un achat. C'est un arbitrage."
2.  **Comparaison Scénarios** (`comparateur`) : "Perte actuelle vs actif".
3.  **Projection 20 ans** (`projection`) : "Cash flow — actif — rendement".
4.  **Analyse de risque** (`risque`) : "Le vrai risque = ne rien faire".
5.  **Structuration financière** (`taux`) : "Opération blanche — financée par économies".
6.  **Décision** (`decision`) : "Timing = seule variable".

### � STANDARD (Focus : Logique, Autonomie, Bon Sens)
1.  **Choc de réalité** : "40 ans → 0€ — on ne possède rien".
2.  **Autonomie** (`autonomie`) : "Vous reprenez le contrôle".
3.  **Projection** (`projection`) : "Écart mesurable — pas opinion".
4.  **Taux** (`taux`) : "On voit si vous êtes éligible".
5.  **Décision** (`decision`) : "On sécurise si c'est oui".

---

## 3. 📖 DICTIONNAIRE DES TEXTES (INFOBULLES)

Ces textes changent automatiquement dans l'interface (`INFO_MODULE...`).

### MODULE 1 : LE CADRE (Institutionnel)

#### `cadreEDF`
*   **Senior** : "Un cadre public de confiance" — *EDF est détenu à 100 % par l’État français. Cela garantit stabilité...*
*   **Banquier** : "Un acteur public structurant" — *Groupe public soumis à des obligations d’État. Continuité, cadre réglementaire...*
*   **Standard** : "Ce que signifie « Groupe EDF »" — *EDF appartient à l’État. Ce n’est pas une société privée opportuniste.*

#### `zeroFaillite`
*   **Senior** : "Une continuité garantie" — *Le risque principal est la disparition de l’acteur. Le cadre EDF protège...*
*   **Banquier** : "Un risque structurel neutralisé" — *Le premier risque d’un actif long terme est la contrepartie. EDF neutralise ce risque...*
*   **Standard** : "Pourquoi c’est important" — *Sur 20 ans, le vrai risque n’est pas le matériel. C’est que l’entreprise n’existe plus.*

---

### MODULE 2 : L'ENGAGEMENT

#### `engagement`
*   **Senior** : "🛡️ Engagement de protection" — *Vous engagez un cadre sécurisé, pas une procédure incertaine.*
*   **Banquier** : "⚖️ Transfert de risque" — *Le risque administratif est porté par EDF. Cadre contractuel et opposable.*
*   **Standard** : "🔒 Zéro risque de blocage" — *Si l'installation ne peut pas se faire, le projet s'arrête sans frais.*

#### `paiement`
*   **Senior** : "🤍 Engagement sans pression" — *Vous ne payez rien tant que tout n'est pas validé.*
*   **Banquier** : "📄 Condition suspensive" — *Contrat inclut conditions suspensives administratives.*
*   **Standard** : "💡 Paiement à la validation" — *Vous avancez seulement quand tout est clair.*

---

### MODULE 3 : LE PARCOURS

#### `cadre` (Pilotage)
*   **Senior** : "🛡️ Délégation sécurisée" — *EDF prend la responsabilité complète du parcours.*
*   **Banquier** : "📋 Pilotage administratif" — *Processus intégralement structuré et piloté par EDF.*
*   **Standard** : "🙌 EDF s’occupe du parcours" — *Vous n’avez pas à vous battre avec des formulaires.*

---

### MODULE 4 : LES GARANTIES (Long Terme) — ⚠️ DYNAMIQUE
**Ce module est désormais piloté par `contentVariants.json`.**

*   **Par défaut :** Contenu standard (tel que décrit ci-dessous).
*   **Si Trigger Senior+Fatigue :** Injection de la variante *Institutionnelle Dense* (Textes longs, réassurance État, infobulles cadenassées).

#### `global` (Défaut)
*   **Senior** : "🛡️ Protection dans le temps" — *Elles couvrent le matériel, la production et le suivi.*
*   **Banquier** : "📑 Cadre de garantie" — *Obligations de résultat et de remplacement. Sécurisé juridiquement.*
*   **Standard** : "🔒 Vous êtes couvert" — *Le matériel est garanti. La production est suivie.*

#### `performance` (Défaut)
*   **Senior** : "☀️ Production surveillée" — *Si elle ne produit pas ce qui est prévu, EDF intervient.*
*   **Banquier** : "📊 Garantie de performance" — *Des seuils de production sont définis contractuellement.*
*   **Standard** : "⚡ Production garantie" — *Si la production baisse, c’est détecté et pris en charge.*


---

## 4. 🧠 POPUPS ET ARGUMENTAIRES SPÉCIAUX

### "Où va mon argent" (`where-money`)
*   **Senior** : "Deux chemins possibles pour le même argent. Un seul vous laisse quelque chose. L’enjeu n’est pas un chiffre, c'est de ne pas regretter."
*   **Banquier** : "Comparaison d’allocation de capital : dépense irréversible vs actif patrimonial. Ce module ne parle pas d’écologie, mais d'arbitrage."
*   **Standard** : "Où vont vos dépenses selon ce que vous décidez aujourd’hui. Au final, soit votre argent part pour toujours, soit il reste chez vous."

### Phrases de Transition (`PROJECTION_PHRASES`)
*   **Senior** : "Ici, l’objectif n’est pas de vous faire choisir. C’est de vous montrer ce que devient votre budget dans le temps..."
*   **Banquier** : "Ce graphique ne présente pas une offre, mais deux trajectoires financières à partir de vos chiffres."
*   **Standard** : "Ici, on ne compare pas deux offres. On regarde simplement ce que devient votre argent dans les deux scénarios."
