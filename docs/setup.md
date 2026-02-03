# ⚙️ Configuration & Déploiement
**Version** : 1.0.0
**Status** : DEVELOPER GUIDE

## 🛠️ Pré-requis
*   Un projet **Supabase** actif.
*   Un compte **Resend** (avec domaine vérifié).
*   **Vercel** pour le déploiement.

## 🔑 Variables d'Environnement
Créez un fichier `.env.local` (ou configurez vos secrets sur Vercel) avec les clés suivantes :

| Variable | Source | Rôle |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Supabase Settings | URL de l'API Supabase |
| `VITE_SUPABASE_ANON_KEY` | Supabase Settings | Clé publique pour le front-end |
| `RESEND_API_KEY` | Resend Settings | Envoi des relances (Backend) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Settings | Bypass RLS pour les Cron Jobs |

## 🚀 Déploiement
### Frontend (Vercel)
1.  Connectez votre repo GitHub.
2.  Assurez-vous que le répertoire racine est correct.
3.  Vercel détectera automatiquement la configuration (Vite / React).

### Backend (Supabase Functions)
Le système d'emailing utilise des Edge Functions :
1.  Installez Supabase CLI.
2.  Déployez la fonction : `supabase functions deploy send-relances`.
3.  Configurez les Secrets sur Supabase : `supabase secrets set RESEND_API_KEY=...`.

### Cron Job
Activez la relance quotidienne à 9h00 via l'extension `pg_cron` de Supabase :
```sql
SELECT cron.schedule(
    'send-pending-emails-daily',
    '0 9 * * *',
    $$
    SELECT net.http_post(
        url := 'https://[URL_FUNCTIONS]/send-relances',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer [SERVICE_ROLE_KEY]"}'::jsonb
    );
    $$
);
```

## 🏗️ Développement Local
```bash
# Installation
npm install

# Build
npm run build

# Dev Mode
npm run dev
```

---
*En cas de problème de synchronisation, vérifiez les Logs dans le territoire "Système" de l'application.*
