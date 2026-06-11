# AIKIVAVIORA Office — отчёт о выполненной работе (MVP-1)

**Студент / автор:** Игорь Кашинцев  
**Проект:** AIKIVAVIORA Office — AI backoffice для отдела продаж  
**Папка:** `Projects/aikivaviora-office/`  
**GitHub:** https://github.com/treshkash323-alt/aikivaviora-office  
**Коммит MVP-1:** `a8c41f6`  
**Supabase (облако):** `daonsqaxbpzoxslahbge` · tenant `customer-demo`  
**Запуск сейчас:** локально http://127.0.0.1:5173  
**Дата фиксации:** 11.06.2026  
**Статус:** MVP-1 выполнен локально · **работа приостановлена** · публичный деплой отложен (см. §2)

**Пояснительная записка:** `docs/Office_MVP1_РУКОВОДСТВО_И_ПЗ.md`

---

## 1. Цель работы

Собрать минимальный рабочий контур **Office** (не «Гранит»): AI-чат для посетителя, автоматические заявки, кабинет сотрудников с тремя ролями, админка настроек заказчика — на **Supabase + Vite/React**, с заглушками до брифинга.

### 1.1. Что должно было получиться (MVP-1)

1. Публичный чат с квалификацией и рекомендацией пакета (DeepSeek через Edge Function).
2. Авто-создание lead из диалога (пакет / контакт / 3+ сообщения).
3. Вход staff: **director**, **manager**, **admin** — разный доступ.
4. Кабинет: обзор, заявки, настройки (admin).
5. Код и документация на GitHub, backend в облаке Supabase.

### 1.2. Что фактически сделано

| № | Результат | Статус |
|---|-----------|--------|
| 1 | Supabase: миграции, RLS, seed tenant `customer-demo` | ✅ |
| 2 | Edge Function `chat` + DeepSeek + syncLead | ✅ |
| 3 | Фронт: чат, login, `/app`, leads, admin | ✅ |
| 4 | 3 staff-пользователя (скрипт + docs) | ✅ |
| 5 | GitHub: push MVP-1 | ✅ |
| 6 | Локальная проверка сценария (скрины) | ✅ |
| 7 | **Публичный URL (Vercel)** | ⏸ отложено |

---

## 2. Временная задержка и причина (важно для отчёта)

### 2.1. Суть

Публичный депл фронта на **Vercel не выполнен**. Это **не блокер MVP-1 по функционалу**: приложение полностью работает **локально** и backend уже в облаке Supabase.

### 2.2. Причина задержки

1. Для деплоя планировался аккаунт Vercel **`treshkash323@gmail.com`** (GitHub `treshkash323-alt`, репозиторий Office).
2. При попытке входа / импорта репозитория аккаунт **заблокирован на проверке** (abuse review) — типичная ситуация для новых аккаунтов Vercel.
3. Отправлен **appeal** (Account Recovery and Appeals), подтверждение: письмо **Vercel — Hobby Case Opened**, case **`01236983`**, email `treshkash323@gmail.com`. Ожидание ответа support: **1–3 рабочих дня**.
4. Альтернативный аккаунт Vercel **`kashintsevigor@gmail.com`** (Igor Kashintsev) **работает**, но привязан к **другому** GitHub-контуру (`barbalong…` / Granit). Деплой Office туда **сознательно не делали**, чтобы не получить два параллельных URL и путаницу, когда разблокируют **tresh**.
5. Альтернативы (Netlify Drop, Cloudflare Pages) **не использовались** — решение: дождаться Vercel на целевом аккаунте.

### 2.3. Влияние на сроки

| Задача | Без задержки | Сейчас |
|--------|--------------|--------|
| Демо функционала | Vercel URL | **Локально** `127.0.0.1:5173` + скрины |
| Staff login из интернета | После Site URL в Supabase Auth | После деплоя |
| Сдача MVP-1 как каркас | — | **Достаточно** локального прогона |

### 2.4. План после паузы

1. Ответ Vercel support по case `01236983` → разблокировка `tresh`.
2. Import `treshkash323-alt/aikivaviora-office` → env → Deploy.
3. Supabase Auth → Site URL + Redirect URLs на `*.vercel.app`.
4. Admin → поле «Сайт» — реальный URL вместо placeholder.

**Приостановка работ:** до завершения двух вебинаров; возобновление — с шага деплоя на Vercel (tresh).

---

## 3. Стек

Vite 5 · React 18 · TypeScript · React Router · Tailwind CSS · Supabase JS · Supabase Edge Functions (Deno) · DeepSeek API · PostgreSQL + RLS · GitHub

---

## 4. Безопасность (кратко)

| Проверка | Результат |
|----------|-----------|
| `.env` в git | **Нет** — только `.env.example` |
| `service_role` во фронте | **Нет** |
| RLS на tenants, profiles, leads, messages | **Да** |
| Edge Function JWT | `verify_jwt = false` для publishable key (документировано) |
| Staff-пароли в репо | Только в `docs/STAFF_USERS.md` (демо-пароли) |

---

## 5. Скриншоты (зафиксировано 10.06.2026)

> Для Word/Google Doc — вставить скрины из сессии демонстрации.  
> **Не включать:** `.env`, ключи Supabase, `service_role`, OTP.

| № | Что снято | Подпись |
|---|-----------|---------|
| **1** | Публичный чат, приветствие, шапка tenant | *Рис. 1. Чат — онлайн-консультант* |
| **2** | Диалог: квалификация → пакет «Старт», 50 000 ₽ | *Рис. 2. AI рекомендует пакет* |
| **3** | Admin: обзор, 1 заявка | *Рис. 3. Кабинет admin — обзор* |
| **4** | Admin: настройки, KB, «…заглушка) тест» | *Рис. 4. Настройки заказчика* |
| **5** | Director: обзор + digest (кратко) | *Рис. 5. Кабинет director* |
| **6** | Заявки: «Пакет: Старт», «В работе», текст диалога | *Рис. 6. Lead из чата* |
| **7** | Manager: обзор и заявки (без «Настройки») | *Рис. 7. Роль manager* |
| **8** | Чат после правки admin — название в шапке | *Рис. 8. KB/настройки влияют на чат* |

**Тестовые аккаунты:** см. `docs/STAFF_USERS.md`

---

## 6. Пошаговый сценарий проверки

```powershell
cd C:\Users\kash-\Python_kash\Cursor\Projects\aikivaviora-office
npm install
npm run dev
```

1. `/` — новый диалог в инкognito → бюджет / пакет → при желании e-mail или телефон.
2. `/login` → **director@customer-placeholder.local** → `/app` → обзор, заявки.
3. **manager@…** → те же заявки, нет пункта «Настройки».
4. **admin@…** → `/app/admin` → правка названия → сохранить → чат в новой вкладке.
5. `npm run build` — сборка без ошибок (проверено).

---

## 7. Результат (чеклист MVP-1)

- [x] Каркас Office без бренда «Гранит»
- [x] Чат + DeepSeek + tenant KB
- [x] Auth, 3 роли, RLS
- [x] Авто-lead из диалога
- [x] Кабинет: обзор, заявки, admin
- [x] GitHub без секретов
- [x] Документация Supabase / staff / Vercel
- [x] Локальная демонстрация со скринами
- [ ] Публичный Vercel URL — **отложено** (§2)
- [ ] MVP-2: AI-digest, секретарь — **не начато**

---

## 8. Ссылки

| Ресурс | URL |
|--------|-----|
| **GitHub** | https://github.com/treshkash323-alt/aikivaviora-office |
| **Локально** | http://127.0.0.1:5173 |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/daonsqaxbpzoxslahbge |

**Документы:** `Office_MVP1_отчёт_для_сдачи.md` · `Office_MVP1_РУКОВОДСТВО_И_ПЗ.md` · `TODO_ROADMAP.md`

---

## 9. Комментарий для преподавателя / заказчика

MVP-1 **AIKIVAVIORA Office** реализован: облачный backend (Supabase), локальный frontend с полным сценарием «чат → заявка → три роли → админка». Код на GitHub. Публичный деплой **намеренно отложен**: аккаунт Vercel `treshkash323@gmail.com` на проверке (appeal case `01236983`); деплой на другой Vercel-аккаунт не выполнялся, чтобы не дублировать контуры. Работа **зафиксирована и приостановлена** до вебинаров; продолжение — деплой на Vercel (tresh) и MVP-2.

---

## 10. Следующий этап (после паузы)

См. `TODO_ROADMAP.md`: Vercel tresh → Auth URLs → брифинг заказчика → MVP-2.

---

*Отчёт · AIKIVAVIORA Office MVP-1 · Игорь Кашинцев · 11.06.2026*
