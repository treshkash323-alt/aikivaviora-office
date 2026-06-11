# AIKIVAVIORA Office — руководство по эксплуатации и пояснительная записка (MVP-1)

**AIKIVAVIORA v.2**

**Office · ПЗ + РЭ · v0.1 · июнь 2026 · Автор: Игорь Кашинцев**

**Проект:** AIKIVAVIORA Office  
**Папка:** `Projects/aikivaviora-office/`  
**GitHub:** https://github.com/treshkash323-alt/aikivaviora-office  
**Дата:** 11.06.2026  
**Статус:** MVP-1 зафиксирован · локальная эксплуатация · деплой отложен

> Этот файл — **пояснительная записка (ПЗ)** и **руководство по эксплуатации (РЭ)** по шаблонам `Docs/PZ_MASTER.md` и `Docs/RE_MASTER.md`.  
> Краткий отчёт со скринами: `Office_MVP1_отчёт_для_сдачи.md`.

---

## История версий

| Версия | Дата | Изменение | Автор |
|--------|------|-----------|-------|
| v0.1 | 11.06.2026 | MVP-1: чат, leads, auth, admin; фиксация паузы | Игорь Кашинцев |

---

# ЧАСТЬ A. ПОЯСНИТЕЛЬНАЯ ЗАПИСКА

## 1. Общие сведения

### 1.1. Назначение документа

Описывает назначение, архитектуру, технические решения и результаты модуля **AIKIVAVIORA Office** — AI-платформы backoffice для отдела продаж (чат, заявки, роли, админка заказчика).

### 1.2. Назначение модуля

Модуль — **веб-приложение (SPA) + облачный backend** для B2B-заказчика: публичный AI-консультант на сайте и внутренний кабинет staff.

**Главная цель:** связать диалог с посетителем и CRM-заявку в одном tenant без отдельного «прототипа Гранит».

Задачи MVP-1:

- квалификация лида в чате (пакеты, бюджет, контакт);
- автоматическое создание lead;
- три роли staff (director, manager, admin);
- настройки компании и база знаний без правки кода.

### 1.3. Место в экосистеме AIKIVAVIORA v.2

- Путь: `Projects/aikivaviora-office/` (отдельный репозиторий от `aikivaviora-granit-consultant`).
- Статус: **MVP-модуль**, не production-hardened.
- Независим от legacy-монолита; общая идея — Supabase + DeepSeek, как в учебных проектах школы.

### 1.4. Ссылки

| Ресурс | Значение |
|--------|----------|
| GitHub | https://github.com/treshkash323-alt/aikivaviora-office |
| Supabase | `daonsqaxbpzoxslahbge` |
| Демо | локально http://127.0.0.1:5173 (публичный URL — после Vercel) |
| Docker | не используется (облачный Supabase) |

---

## 2. Цель работы

Разработать **минимальный рабочий Office** под заказчика с заглушками до брифинга: не форк «Гранита», а отдельный tenant `customer-demo` и три роли с RLS.

---

## 3. Реализованное решение

- **Frontend:** Vite + React + React Router + Tailwind — `/`, `/login`, `/app`, `/app/leads`, `/app/admin`.
- **Backend:** Supabase PostgreSQL (tenants, profiles, leads, conversations, messages), RLS по ролям.
- **AI:** Edge Function `chat` — DeepSeek, системный промпт из KB tenant, `syncLead` после сообщений.
- **Auth:** Supabase Auth, профили в `profiles`, привязка к tenant.
- **Ops:** скрипт `scripts/create-staff-users.mjs`, docs, seed SQL.

---

## 4. Архитектура

```
Браузер (посетитель / staff)
        │
        ▼
Vite SPA (127.0.0.1:5173 или Vercel*)
        │
        ├── REST ──► Supabase (Auth, tenants, leads, …)
        │
        └── POST ──► Edge Function /functions/v1/chat
                           │
                           ├── DeepSeek API
                           └── syncLead → leads

* Vercel — запланирован, см. отчёт §2 (задержка)
```

### Структура репозитория

```
aikivaviora-office/
├── src/                    — React UI
├── supabase/
│   ├── migrations/         — схема + RLS
│   ├── functions/chat/     — Edge Function
│   └── seed.sql
├── scripts/                — staff users
├── docs/                   — setup, отчёт, ПЗ
├── .env.example
└── vercel.json             — SPA rewrites
```

---

## 5. Технологический стек

| Уровень | Технология |
|---------|------------|
| Frontend | Vite 5, React 18, TypeScript, Tailwind |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions) |
| LLM | DeepSeek (секрет в Supabase Functions) |
| Деплой (план) | Vercel — статика `dist` |
| Репозиторий | GitHub `treshkash323-alt` |

---

## 6. Данные и KB

- Tenant **`customer-demo`**: заглушки компании, приветствие, KB (пакеты Старт / Бизнес / Премиум).
- Правка через **Admin → Настройки** или `supabase/seed.sql`.
- После брифинга — замена placeholder-данных реальными.

---

## 7. Тестирование

### Smoke (ручной)

```powershell
npm run dev
npm run build
```

Проверено:

- чат отвечает, рекомендует пакет;
- lead появляется в `/app/leads`;
- director / manager / admin — разное меню и доступ;
- admin сохраняет KB → чат показывает новое название.

| Метрика | Значение |
|---------|----------|
| Сценариев проверено | 5+ |
| Критичных ошибок | 0 |
| Production URL | нет (ожидание Vercel) |

---

## 8. Выполненные доработки в ходе разработки

- JWT Edge Function → `verify_jwt = false` для publishable key.
- Убран `lucide-react` (блокировки сети) → локальные иконки.
- Vite `host: 127.0.0.1`.
- Авто-`syncLead` (пакет / контакт / 3+ сообщения).
- Скрипт создания 3 staff-пользователей.

---

## 9. Ограничения текущей версии

- **Нет публичного URL** — деплой Vercel отложен (appeal case `01236983`, аккаунт `treshkash323@gmail.com`).
- Digest директора — **статистика**, не AI (MVP-2).
- Нет AI-секретаря, звонков, маркетинга (MVP-2 / MVP-3).
- Embed на сайт заказчика не делался.
- Данные заказчика — **заглушки**.

### 9.1. Временная задержка (формулировка для отчётности)

Публичный деплой frontend **не выполнен по внешней причине**: блокировка / проверка аккаунта Vercel, привязанного к репозиторию `treshkash323-alt`. Подана апелляция; сознательно **не** деплоили на второй аккаунт Vercel (`kashintsevigor@gmail.com`), чтобы избежать двух параллельных production-контуров. **Функционал MVP-1 подтверждён локально**; backend уже в облаке Supabase.

---

## 10. Направления развития (MVP-2+)

- Деплой Vercel (tresh) + Supabase Auth Site URL.
- AI-digest для director.
- AI-секретарь.
- Звонки, маркетинг.
- Embed чата на сайт заказчика.
- Замена заглушек после брифинга.

---

## 11. Вывод (ПЗ)

Реализован модуль **AIKIVAVIORA Office MVP-1**: чат → заявка → кабинет с тремя ролями → админка KB. Решение пригодно для учебной демонстрации и дальнейшего развития. Работа **зафиксирована**; продолжение после вебинаров — деплой и MVP-2.

---

# ЧАСТЬ B. РУКОВОДСТВО ПО ЭКСПЛУАТАЦИИ

## 1. Наименование

**AIKIVAVIORA Office** · AI backoffice: чат + CRM-заявки + admin.

**Версия:** MVP-1 (`a8c41f6`) · 11.06.2026.

## 2. Назначение

- Публичный AI-консультант для посетителя.
- Учёт заявок из чата для manager / director.
- Настройки tenant для admin.

## 3. Требования к среде

- Node.js 18+ (локально).
- npm.
- Файл `.env` (из `.env.example`).
- Интернет (Supabase + DeepSeek).

## 4. Подготовка

```powershell
cd C:\Users\kash-\Python_kash\Cursor\Projects\aikivaviora-office
copy .env.example .env
# заполнить VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_DEFAULT_TENANT_SLUG
npm install
```

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `VITE_SUPABASE_URL` | ✅ | `https://daonsqaxbpzoxslahbge.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Publishable key из Supabase |
| `VITE_DEFAULT_TENANT_SLUG` | ✅ | `customer-demo` |

DeepSeek и `service_role` — только в **Supabase Dashboard → Edge Functions → Secrets** (не во фронте).

## 5. Запуск

```powershell
npm run dev
```

Открыть: **http://127.0.0.1:5173**

Staff: **http://127.0.0.1:5173/login** — см. `docs/STAFF_USERS.md`.

Production-сборка:

```powershell
npm run build
```

## 6. Сценарии эксплуатации

1. **Чат посетителя** — `/`, диалог до рекомендации пакета и/или контакта.  
2. **Заявки** — `/app/leads` после входа staff.  
3. **Admin** — `/app/admin` → правка KB → проверка в новом чате.  
4. **Director** — `/app` → обзор и краткий digest.

## 7. Типовые проблемы

| Проблема | Решение |
|----------|---------|
| Белый экран | Проверить `.env`, `npm run dev` на `127.0.0.1:5173` |
| Invalid JWT на chat | Edge Function с `--no-verify-jwt`; redeploy |
| Invalid login | Запустить `node scripts/create-staff-users.mjs` с `service_role` |
| Нет lead | Новый диалог в инкognito; 3+ сообщения или пакет/контакт |

## 8. Ограничения РЭ

РЭ актуально для **локального** режима. После деплоя Vercel — обновить Site URL в Supabase Auth и поле «Сайт» в admin (см. `docs/VERCEL_DEPLOY.md`).

---

*ПЗ + РЭ · AIKIVAVIORA Office MVP-1 · Игорь Кашинцев · 11.06.2026*
