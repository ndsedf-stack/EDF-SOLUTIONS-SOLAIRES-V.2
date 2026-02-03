# 🌍 Guest View : L'Interface Client Externalisée

La **Guest View** est le portail sécurisé "Read-Only" destiné au client final. Elle permet de consulter les résultats de l'étude (Simulation, PDF, Éligibilité) sans accéder au Cockpit administratif.

## 🎯 Objectif
Offrir une transparence totale au client en lui donnant accès à une version simplifiée et sécurisée de son étude, accessible via un lien unique ou QR Code, souvent depuis son propre appareil.

## 🔒 Sécurité & Accès
Le composant principal est `GuestView.tsx`. Il implémente plusieurs couches de protection :
1.  **Isolation Route** : `/guest/:id` est une route distincte du `/admin`.
2.  **Security Layer** : Le composant `<SecurityLayer />` enveloppe la vue.
    *   Vérification du token de session.
    *   Protection contre les accès non autorisés.
3.  **Read-Only Strict** : Aucune mutation de données n'est possible depuis cette vue (pas de modification de prix, de taux, etc.).

## 🧩 Composants Clés
*   **Synthèse Financière** : Affichage clair des gains, économies et du reste à charge.
*   **Graphiques de Projection** : Visualisation simplifiée de la production solaire cumulée (Charts Recharts).
*   **Module Financement** : Présentation du financement validé (Taux, Mensualités).
*   **Téléchargement PDF** : Accès direct au dossier technique en PDF.
*   **Statut de Validation** : Indicateurs de conformité technique (RGE, Zone, Toiture).

## 🚀 Workflow Typique
1.  Le Commercial configure l'étude dans le **Cockpit**.
2.  Il génère un lien "Guest" ou scanne le QR Code.
3.  Le Client ouvre le lien sur son smartphone/tablette.
4.  Le Client consulte, valide mentalement, et peut télécharger les documents.

## ⚠️ Limitations Techniques
*   Nécessite une connexion internet active (fetch Supabase).
*   Les calculs complexes sont effectués côté serveur ou pré-calculés ; la vue n'embarque pas le moteur de simulation lourd pour rester légère.
