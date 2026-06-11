# AIKIVAVIORA Office

AI-платформа backoffice для отдела продаж: чат-консультант, заявки, три роли сотрудников, админка заказчика.

**Без бренда «Гранит»** — сразу под заказчика (tenant + заглушки до брифинга).

## Быстрый старт

1. [Создать Supabase](docs/SUPABASE_SETUP.md) — проект, миграции, DeepSeek, три пользователя  
2. Скопировать `.env.example` → `.env`  
3. `npm install && npm run dev`  
4. [Деплой фронта](docs/FRONTEND_OPTIONS.md) — Vercel (рекомендуется)

## Роли

| Роль | Доступ |
|------|--------|
| **director** | все заявки tenant, обзор (digest в MVP-2) |
| **manager** | свои / неназначенные заявки |
| **admin** | настройки компании, KB, все заявки |

## Структура

```
src/                 — Vite + React (чат, login, кабинет)
supabase/migrations/ — tenants, profiles, leads, chat
supabase/functions/  — Edge Function chat (DeepSeek)
docs/                — Supabase setup, варианты фронта
assets/kp-images/    — материалы КП
build_kp_docx.py     — сборка КП в Word
```

## MVP статус

- [x] Каркас, auth, 3 роли, чат, tenant KB  
- [x] Авто-создание lead из диалога  
- [x] Кабинет: заявки, обзор, настройки admin  
- [ ] AI-секретарь, полный digest директора (MVP-2)  
- [ ] Звонки, маркетинг (MVP-3)  

## Документация

- [Supabase setup](docs/SUPABASE_SETUP.md)  
- [Staff-пользователи](docs/STAFF_USERS.md)  
- [Деплой Vercel](docs/VERCEL_DEPLOY.md)  
- [Варианты фронта](docs/FRONTEND_OPTIONS.md)  
- **[Отчёт MVP-1](docs/Office_MVP1_отчёт_для_сдачи.md)** · **[ПЗ + РЭ](docs/Office_MVP1_РУКОВОДСТВО_И_ПЗ.md)** · [Roadmap](TODO_ROADMAP.md)  

**Статус 11.06.2026:** MVP-1 зафиксирован, пауза до Vercel (tresh, case `01236983`).

## Репозиторий

https://github.com/treshkash323-alt/aikivaviora-office
