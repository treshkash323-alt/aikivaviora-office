# Staff-пользователи (3 роли)

## Вариант A — скрипт (быстро)

1. Supabase Dashboard → **Settings → API** → скопируйте **service_role** (секрет, не во фронт).

2. В **новом** терминале:

```powershell
cd C:\Users\kash-\Python_kash\Cursor\Projects\aikivaviora-office

$env:SUPABASE_URL="https://daonsqaxbpzoxslahbge.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ...service_role..."

node scripts/create-staff-users.mjs
```

3. Вход: http://127.0.0.1:5173/login

| E-mail | Роль | Пароль (демо) |
|--------|------|----------------|
| director@customer-placeholder.local | director | `Office_Director_2026!` |
| manager@customer-placeholder.local | manager | `Office_Manager_2026!` |
| admin@customer-placeholder.local | admin | `Office_Admin_2026!` |

Смените пароли после первого входа.

## Вариант B — вручную в Dashboard

**Authentication → Users → Add user** для каждого:

User Metadata (JSON):

```json
{"role":"director","full_name":"Директор"}
```

Роли: `director` | `manager` | `admin`

---

## Права

| Роль | Меню |
|------|------|
| director | Обзор, Заявки (все tenant) |
| manager | Обзор, Заявки (свои / без assignee) |
| admin | + Настройки (KB, компания) |
