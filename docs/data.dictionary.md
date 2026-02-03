# 📖 Dictionnaire de Données : Table `studies`
**Version** : 1.0.0
**Status** : TECHNICAL REFERENCE

Ce document est la source de vérité pour la structure des données métier dans Supabase.

## 🗄️ Champs Fondamentaux
| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique universel du dossier. |
| `client_id` | UUID | Clé étrangère vers la table `clients`. |
| `status` | String | État administratif : `sent` (étude envoyée), `signed` (signé), `cancelled` (annulé). |
| `created_at` | Timestamp | Date de création du dossier. |
| `signed_at` | Timestamp | Date de signature (déclenche le compte à rebours de 14j). |

## 💰 Champs Financiers
| Champ | Type | Description |
| :--- | :--- | :--- |
| `install_cost` | Numeric | Prix total de l'installation (utilisé pour le calcul du CA). |
| `deposit_amount` | Numeric | Montant de l'acompte prévu. |
| `deposit_paid` | Boolean | Indicateur de sécurisation du dossier (Vrai = Sortie de War Room). |
| `deposit_paid_at`| Timestamp | Date de réception de l'acompte. |
| `payment_mode` | String | Moyen de paiement (virement, chèque, etc.). |
| `contract_secured`| Boolean | Indicateur manuel de sécurité renforcée. |

## 📨 Table `email_leads` (Prospects Froids)
*Utilisé pour l'AXE C (Leads jamais joints).*
| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique. |
| `client_id` | UUID | Lien vers la table `clients`. |
| `email_step` | Integer | Étape actuelle dans la séquence de prospection. |
| `total_opens` | Integer | Nombre total d'ouvertures marketing. |
| `total_clicks`| Integer | Nombre total de clics marketing. |
| `last_opened_at` | Timestamp | Date de la dernière ouverture. |
| `last_clicked_at` | Timestamp | Date du dernier clic. |
## 📡 Champs de Tracking (Calculés)
*Ces champs ne sont pas forcément en base mais sont produits par le Brain via les `tracking_events`.*
| Nom Brain | Rôle |
| :--- | :--- |
| `views` | Nombre d'ouvertures d'emails ou de vues de l'étude. |
| `clicks` | Nombre d'interactions réelles (clic sur un bouton/lien). |
| `send_count` | Nombre total de sollicitations envoyées au client. |

## 📑 JSON `study_data`
Contient les spécificités techniques de l'étude (puissance, économies, prix mensuel, etc.). Ce payload est utilisé pour générer dynamiquement le contenu des emails personnalisés.

---
*Note: La table `email_queue` gère l'orchestration temporelle des envois basés sur ces statuts.*
