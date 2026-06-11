# Деплой на Vercel

> **Vercel заблокировал / проверяет аккаунт?** См. [Cloudflare Pages](CLOUDFLARE_DEPLOY.md) или раздел «Быстрый демо-URL» ниже — Office работает без Vercel.

## 1. Подготовка

Убедитесь, что в GitHub актуален репозиторий:  
https://github.com/treshkash323-alt/aikivaviora-office

Локально проверка:

```powershell
npm run build
```

## 2. Import в Vercel

1. https://vercel.com/new  
2. Import Git Repository → `treshkash323-alt/aikivaviora-office`  
3. Framework Preset: **Vite**  
4. Root Directory: `./` (корень)  
5. Build Command: `npm run build`  
6. Output Directory: `dist`

## 3. Environment Variables

В Vercel → Project → Settings → Environment Variables:

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://daonsqaxbpzoxslahbge.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_…` (Publishable key из Supabase) |
| `VITE_DEFAULT_TENANT_SLUG` | `customer-demo` |

Применить для **Production**, **Preview**, **Development**.

## 4. Deploy

**Deploy** → дождаться зелёного статуса.

URL вида: `https://aikivaviora-office-xxx.vercel.app`

## 5. После деплоя

1. Supabase → **Authentication → URL Configuration**  
   - Site URL: ваш Vercel URL  
   - Redirect URLs: `https://….vercel.app/**`

2. Admin → **Настройки** → поле **Сайт** → вставить Vercel URL

3. Проверить:
   - `/` — чат  
   - `/login` — вход staff  
   - `/app/leads` — заявки  

## 6. Свой домен (позже)

Vercel → Domains → Add → CNAME на `cname.vercel-dns.com`

---

Supabase Edge Function `chat` уже на облаке — отдельно деплоить фронт не нужно, только env в Vercel.
