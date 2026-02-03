# Cockpit System Contract — AUTOPILOTE SOLAIRE
**Version** : 1.0.0
**Status** : FORMAL CONTRACT

## 1. Rôle Système du Cockpit
Le Cockpit est l'interface cognitive d'**AUTOPILOTE SOLAIRE**. Son unique but est d'éliminer l'incertitude décisionnelle de l'opérateur humain. Ce n'est pas un tableau de bord, c'est un centre de commandement "Next-Best-Action" (NBA).

## 2. Obligations du Cerveau (Brain) envers le Cockpit
Le Cerveau s'engage à fournir un `SystemSnapshot` immuable et pré-calculé contenant :
- **Clarté Décisionnelle** : Une recommandation d'action immédiate (`NextAction`).
- **Pression Opérationnelle** : Un état de tension systémique (Normal, Actif, Urgent).
- **KPIs Vitalité** : Des métriques de santé agrégées (conversion, rétention, volume actif).
- **Intégrité Temporelle** : Un timestamp de fraîcheur des données.

## 3. Obligations du Cockpit envers l'Humain
- **Non-Distraction** : Ne jamais afficher de données qui n'influencent pas une action immédiate.
- **Réduction de Charge** : Transformer la complexité des données brutes en indicateurs binaires ou directionnels.
- **Escalade** : Forcer la transition vers la **War Room** dès que les seuils de sécurité sont franchis.

## 4. Contrat de Données Cerveau → Cockpit
| Élément | Type | Invariant |
| :--- | :--- | :--- |
| `SystemStatus` | Enum | Doit refléter le pire état détecté par le système. |
| `NextAction` | Object | Doit être unique et actionnable sans recherche supplémentaire. |
| `KeyMetrics` | Object | Uniquement des agrégats. Aucune ligne de base de données. |
| `HealthVector` | Array | Tendance de performance sur les 7 derniers cycles (immuable). |

## 5. États Officiels du Cockpit
- **STABLE** : Flux nominal. Focus sur l'optimisation.
- **SOUS TENSION** : Volume élevé. Temps de réponse critique.
- **CRITIQUE** : Danger de rupture. Escalade War Room activée.
- **AVEUGLE (BLIND)** : Désynchronisation Brain/DB. Affichage d'un état de diagnostic pur.
- **DYNAMIQUE** : En cours de rafraîchissement.

## 6. Blocs Autorisés et Responsabilités
1. **Indicator Zone** : Affiche la prochaine action prioritaire.
2. **State Cluster** : Affiche la santé globale du système (KPIs consolidés).
3. **HUD (Head-Up Display)** : Raccourcis de navigation vers les territoires spécialisés.
4. **Alert Overlay** : Communications critiques du Brain.

## 7. Sorties Autorisées et Sémantique
- **SWITCH(Territory)** : Transition vers une zone d'exécution (War Room, Registres).
- **REFRESH()** : Demande de re-calcul global au Brain.
- **ACKNOWLEDGE(Alert)** : Notification au Brain que l'humain a pris connaissance d'un état critique.

## 8. Règles d'Escalade Automatique
- Si `metrics.urgencyMode.active === true` : Basculement immédiat et forcé vers **WAR ROOM**.
- Si `loading === true` pendant > 10s : Basculement vers état **AVEUGLE**.
- Si `error !== null` : Verrouillage du cockpit et affichage du diagnostic système.

## 9. Alimentation de la Mémoire Décisionnelle
Chaque clic ou vue dans le cockpit est loggué par le Brain pour affiner :
- La pertinence des `NextBestActions`.
- Le temps de réaction humain face aux alertes.
- L'efficacité des transitions de territoire.

## 10. Invalidation du Cockpit (Contraintes Absolues)
Le cockpit est considéré comme **invalide** et doit être refactoré s'il :
- **Expose une liste** (Table, Pipeline, Logs détaillée).
- **Permet l'exploration** (Filtres complexes, multi-sélection).
- **Autorise la lecture directe de la DB** (Pas de bypass du Brain).
- **Est personnalisable** (L'ordre des informations est dicté par le Brain, pas par l'utilisateur).

---
*Ce document fait foi pour toute future implémentation ou modification du territoire COCKPIT.*
