# Supabase: создание и деплой AIKIVAVIORA Office

Создать облачный проект **можно только в вашем аккаунте** Supabase (нужен логин). Ниже — пошагово.

## 1. Новый проект Supabase

1. Откройте https://supabase.com/dashboard  
2. **New project**  
3. Имя: `aikivaviora-office`  
4. Пароль БД — сохраните в менеджер паролей  
5. Регион — ближайший (например Frankfurt)  
6. Дождитесь статуса **Active**

Запишите:

| Параметр | Где взять |
|----------|-----------|
| Project URL | Settings → API → Project URL |
| anon public | Settings → API → anon public |
| service_role | Settings → API → service_role (только сервер, не во фронт) |
| Project ref | из URL: `https://XXXX.supabase.co` → `XXXX` |

## 2. Связать репозиторий с проектом

```powershell
cd Projects\aikivaviora-office
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
```

## 3. Применить схему и seed

```powershell
npx supabase db push
```

Seed (tenant `customer-demo` с заглушками заказчика):

```powershell
npx supabase db query --linked --file supabase/seed.sql
```

Или в SQL Editor Dashboard вставьте содержимое `supabase/seed.sql`.

## 4. Edge Function `chat`

```powershell
npx supabase functions deploy chat
```

Secrets (Dashboard → Edge Functions → Secrets или CLI):

```powershell
npx supabase secrets set DEEPSEEK_API_KEY=sk-ВАШ_НОВЫЙ_КЛЮЧ
```

`SUPABASE_URL` и `SUPABASE_SERVICE_ROLE_KEY` в Edge Functions подставляются автоматически.

## 5. Три сотрудника (роли)

Authentication → Users → **Add user** (или Sign up через `/login` после включения).

Роль задаётся в **User Metadata** при создании (JSON):

```json
{ "role": "director", "full_name": "Директор" }
```

Допустимые значения: `director`, `manager`, `admin`.

Пример троицы:

| E-mail (заглушка) | role |
|-------------------|------|
| director@customer-placeholder.local | director |
| manager@customer-placeholder.local | manager |
| admin@customer-placeholder.local | admin |

Пароли — временные, сменить после первого входа.

> Пользователь создаётся **после** seed tenant `customer-demo`, иначе триггер профиля выдаст ошибку.

## 6. Локальный фронт

```powershell
copy .env.example .env
# вписать VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

- Чат клиента: http://localhost:5173/  
- Вход сотрудников: http://localhost:5173/login  

## 7. Деплой фронта (Vercel)

1. Import repo `treshkash323-alt/aikivaviora-office`  
2. Framework: Vite  
3. Environment: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_DEFAULT_TENANT_SLUG=customer-demo`  
4. Deploy  

URL вида `https://aikivaviora-office-xxx.vercel.app` — подставьте в `tenants.site_url` (админка → Настройки).

## Проверка

1. Чат отвечает через DeepSeek (не mock)  
2. Login для трёх ролей — разный доступ в меню  
3. Admin → Настройки — правка названия компании и KB  

## Troubleshooting

- **403 на chat** — проверьте deploy function и DEEPSEEK_API_KEY  
- **Tenant not found** — выполните seed.sql  
- **Profile error on signup** — сначала seed, потом пользователи  
