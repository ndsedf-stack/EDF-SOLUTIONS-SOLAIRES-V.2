# GuestView — Règles de contenu, events tracked, RGPD

But
GuestView est l'étude laissée chez le client : actif vivant qui rassure et permet de suivre le comportement post‑rdv.

Contenu minimal requis
- Titre studieux : nom projet + référence dossier.
- Tarif résumé & simulation graphique.
- Module Sécurité visible (garanties, certifications).
- CTA discret : "Relire votre offre / Télécharger / Contacter votre conseiller".
- Information légale : droit de rétractation, coordonnées EDF ENR, mentions RGPD.

RGPD & Opt‑out
- Respecter `client.email_optout`: si true, ne pas envoyer emails ni tracker identifiable (anonymize or skip).
- GuestView doit utiliser un token unique (guest_view_token) et TTL raisonnable (ex: 30 j).
- Conserver auditable logs anonymisés si nécessaire; ne pas stocker PII dans tracking_events.

Events tracked (standard)
- `view` : page ouverte (payload: study_id, timestamp, guest_token)
- `section_click` : interaction (payload: study_id, section, element_id, timestamp)
- `email_open` : déclenché via pixel (payload: study_id, timestamp)
- `email_click` : click sur email link (payload: study_id, link, timestamp)
- `download_pdf` : téléchargement du devis (payload: study_id, timestamp)
- `sign_intent` : bouton d'intention de signature cliqué (payload: study_id, timestamp)

Déduplication & paramétrage
- Dédup par fenêtre configurable `TRACK_DEDUP_SECONDS` (recommandé 60–90s).
- Ne pas considérer deux opens dans la même fenêtre comme deux ouvertures distinctes.

Wording & UX (exemples)
- Titre : "Votre étude personnalisée — AUTOPILOTE SOLAIRE"
- Sécurité : "EDF — garanties et certifications" (pas de tournures agressives)
- CTA : "Relire l'offre" / "Télécharger le récapitulatif"
- Pas de wording anxiogène ou de comparaison agressive.

Expiration & sécurité technique
- Token-based URL : `/guest/{studyId}?t={token}`
- TTL paramétrable (par défaut : 30 jours)
- Révocation possible par le commercial via dashboard (flag `guest_view_revoked`)
