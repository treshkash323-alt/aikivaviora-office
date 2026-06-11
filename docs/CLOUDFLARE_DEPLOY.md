# Деплой на Cloudflare Pages (замена Vercel)

Если Vercel проверяет или блокирует аккаунт — **Cloudflare Pages** даёт такой же бесплатный URL и деплой из GitHub.

## 1. Регистрация

1. https://dash.cloudflare.com/sign-up (можно через Google / GitHub)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**

## 2. Подключить GitHub

1. **Connect GitHub** → разрешить доступ к `treshkash323-alt/aikivaviora-office`
2. Выбрать репозиторий **aikivaviora-office**

## 3. Настройки сборки

| Поле | Значение |
|------|----------|
| Production branch | `main` |
| Framework preset | Vite (или None) |
| Build command | `npm run build` |
| Build output directory | `dist` |

## 4. Environment variables

**Settings → Environment variables** (Production и Preview):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `https://daonsqaxbpzoxslahbge.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Publishable key из Supabase |
| `VITE_DEFAULT_TENANT_SLUG` | `customer-demo` |

## 5. Deploy

**Save and Deploy** → URL вида `https://aikivaviora-office.pages.dev`

SPA-маршруты (`/login`, `/app/...`) работают через `public/_redirects`.

## 6. После деплоя

Supabase → **Authentication → URL Configuration**:

- **Site URL** → ваш `*.pages.dev` URL  
- **Redirect URLs** → `https://….pages.dev/**`

Admin → **Настройки** → поле **Сайт** → тот же URL.

## Быстрый демо без Git (5 минут)

Если нужно показать заказчику **сегодня**, пока ждёте Vercel:

```powershell
cd C:\Users\kash-\Python_kash\Cursor\Projects\aikivaviora-office
npm run build
```

Папку `dist` перетащите на https://app.netlify.com/drop — получите временный URL.

> Env уже «запечены» в сборку из локального `.env` — для production позже лучше Cloudflare/Git.
