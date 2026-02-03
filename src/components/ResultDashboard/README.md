# ResultDashboard — Guide d'utilisation terrain & Wording critique

But du module
Le ResultDashboard est l'arme de vente en rendez‑vous. S'utilise en face à face, sur un écran partagé, pour faire valider la décision par le client.

Principes UX / Wording (non négociable)
- Ton : institutionnel, calme, adulte (EDF centenaire). Pas de pression anxiogène.
- Objectif : faire apparaître l'erreur de ne pas agir, sans forcer (le client doit se convaincre).
- Chaque élément affiché doit : aider à signer OR réduire le risque d'annulation OR supprimer une objection.

Structure recommandée (ordre de visibilité)
1. Header succinct (client, montant net, statut dossier).
2. Module Sécurité : garanties, certifications, visites, garanties longues (mettre en évidence points qui tiennent la décision).
3. Projection financière : kWh, production, économies (montrer années de ROI, ne pas noyer en € inutiles).
4. Comparatif Avec / Sans (visuel) : rester factuel.
5. Options de financement : claire, calculs précis, pas de sur‑promesse.
6. CTA final : `Signer` / `Sécuriser maintenant (Acompte)` + `Guest View` (envoyer lien).

Script de présentation (checklist 4–6 phrases)
- Présenter objectif : "Voilà la solution adaptée pour votre maison, chiffrée et validée."
- Montrer Sécurité : "EDF, garanties..., visites et certifications — tout est couvert."
- Montrer ROI : "Voici votre production estimée (kWh) et ce que vous économisez sur X ans."
- Transformer l'objection prix : "Si on laisse de côté le prix, est-ce bien la solution que vous souhaitez ?"
- Finaliser : "Souhaitez‑vous que je sécurise votre dossier maintenant ?"

Checklist à cocher avant signature (terrain)
- Photomontage validé avec le client.
- Calepinage vérifié.
- Questions d'usage électrique validées (kWh).
- Mode de paiement discuté et proposition de financement préparée.
- Acompte et modalités expliqués (droit de rétractation expliqué calmement).
- GuestView prêt et testé (envoie / ouverture).

Interactions UI & données
- Ne pas effectuer d'UPDATE/DELETE sans confirmation modale.
- Toute action critique (signature, annulation) doit produire un `decision_logs` pour traçabilité.
- Si le client refuse : envoyer de suite la version "offre récapitulative" par mail (template).
