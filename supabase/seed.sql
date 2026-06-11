-- Demo tenant for first customer onboarding (placeholder branding)

INSERT INTO public.tenants (
  slug,
  company_name,
  chat_greeting,
  contact_email,
  contact_phone,
  site_url,
  kb_text
) VALUES (
  'customer-demo',
  'Компания заказчика (заглушка)',
  'Здравствуйте. Я онлайн-консультант компании. Помогу разобраться с услугами и подобрать подходящий вариант. Задам несколько уточняющих вопросов.',
  'office@customer-placeholder.local',
  '+7 (111) 111-11-11',
  'https://demo-customer-placeholder.vercel.app',
  E'# База знаний заказчика (заглушка — заменить после брифинга)\n\nКомпания: Компания заказчика (заглушка)\nСайт: https://demo-customer-placeholder.vercel.app\nE-mail: office@customer-placeholder.local\nТелефон: +7 (111) 111-11-11\n\n## Услуги\n- Услуга «Старт» — от 50 000 ₽\n- Услуга «Бизнес» — от 120 000 ₽\n- Услуга «Премиум» — от 250 000 ₽\n\n## Правила консультанта\n- Не придумывать цены вне списка.\n- Задавать по одному уточняющему вопросу.\n- После выяснения потребности и бюджета рекомендовать один пакет.\n- Если данных нет — предложить оставить телефон или e-mail для связи с менеджером.'
);
