import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type ChatMsg = { role: string; content: string };

type TenantRow = {
  id: string;
  company_name: string;
  chat_greeting: string;
  kb_text: string;
};

const SYSTEM_BASE = `Ты — AI-консультант отдела продаж B2B-компании. Язык: русский, обращение на «вы». Тон: уважительный, без давления.

Источник фактов: только база знаний ниже. Не придумывай цены, скидки и сроки.

Сценарий:
1) Приветствие уже показано на сайте — не повторяй его.
2) После каждого ответа клиента — короткий комментарий (1–2 предложения) и РОВНО ОДИН уточняющий вопрос.
3) Уточни по очереди: актуальность заказа, тип потребности, сроки, бюджет.
4) После бюджета — рекомендуй ОДИН пакет с 2–3 причинами по базе.
5) Нет данных → предложи оставить телефон или e-mail для менеджера.

Запреты: не здороваться заново; не рекомендовать несколько пакетов сразу.`;

function stageHint(userTurn: number): string {
  if (userTurn <= 0) return "";
  if (userTurn === 1) {
    return "ЭТАП: первый ответ. Задайте ОДИН вопрос — заказ уже планируется или клиент пока изучает варианты?";
  }
  if (userTurn === 2) {
    return "ЭТАП: задайте ОДИН вопрос — что именно нужно из услуг компании?";
  }
  if (userTurn === 3) {
    return "ЭТАП: задайте ОДИН вопрос — есть ли желаемые сроки?";
  }
  if (userTurn === 4) {
    return "ЭТАП: задайте ОДИН вопрос — какой бюджетный диапазон рассматриваете?";
  }
  return "ЭТАП: рекомендация одного пакета по базе или ответ на FAQ.";
}

function adminClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

async function loadTenant(slug: string): Promise<TenantRow | null> {
  const sb = adminClient();
  const { data, error } = await sb
    .from("tenants")
    .select("id, company_name, chat_greeting, kb_text")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function extractContacts(messages: ChatMsg[]): { email: string | null; phone: string | null } {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");
  const email =
    userText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)?.[0] ?? null;
  const phoneMatch =
    userText.match(/(?:\+7|8)[\s(-]*(?:\d[\s()-]*){10,}/)?.[0] ??
    userText.match(/\b9\d{9}\b/)?.[0] ??
    null;
  return { email, phone: phoneMatch };
}

function extractBudget(messages: ChatMsg[]): string | null {
  for (const m of [...messages].reverse()) {
    if (m.role !== "user") continue;
    const t = m.content.toLowerCase();
    if (/бюджет|₽|руб|тыс|млн|средн|дорог|дешев|пакет|старт|бизнес|премиум/.test(t)) {
      return m.content.slice(0, 200);
    }
  }
  return null;
}

function detectRecommended(assistantText: string, userTurn: number): string | null {
  if (userTurn < 4) return null;
  const t = assistantText.toLowerCase();
  if (/«премиум»|"премиум"|пакет «премиум»|пакет "премиум"/.test(t) && /рекоменд|оптим|подходит|предлага/.test(t)) {
    return "Премиум";
  }
  if (/«бизнес»|"бизнес"|пакет «бизнес»/.test(t) && /рекоменд|оптим|подходит|предлага/.test(t)) {
    return "Бизнес";
  }
  if (/«старт»|"старт"|пакет «старт»/.test(t) && /рекоменд|оптим|подходит|предлага/.test(t)) {
    return "Старт";
  }
  if (userTurn >= 5 && /бизнес/.test(t)) return "Бизнес";
  if (userTurn >= 5 && /премиум/.test(t)) return "Премиум";
  if (userTurn >= 5 && /старт/.test(t)) return "Старт";
  return null;
}

function buildNeedSummary(messages: ChatMsg[]): string {
  return messages
    .filter((m) => m.role === "user")
    .slice(0, 6)
    .map((m) => m.content)
    .join(" · ")
    .slice(0, 500);
}

async function syncLead(
  sb: SupabaseClient,
  tenantId: string,
  conversationId: string,
  messages: ChatMsg[],
  userTurn: number,
  assistantText: string,
): Promise<void> {
  const { email, phone } = extractContacts(messages);
  const recommended = detectRecommended(assistantText, userTurn);
  const budget = extractBudget(messages);
  const needSummary = buildNeedSummary(messages);

  const shouldSync = Boolean(email || phone || recommended || userTurn >= 3);
  if (!shouldSync) return;

  const row = {
    tenant_id: tenantId,
    conversation_id: conversationId,
    email,
    phone,
    recommended,
    budget_range: budget,
    need_summary: needSummary,
    status: email || phone ? "qualified" : recommended ? "contacted" : "new",
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await sb
    .from("leads")
    .select("id")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (existing?.id) {
    await sb.from("leads").update(row).eq("id", existing.id);
  } else {
    await sb.from("leads").insert(row);
  }
}

async function persistChat(
  tenantId: string,
  sessionKey: string,
  messages: ChatMsg[],
  assistantText: string,
  userTurn: number,
): Promise<void> {
  const sb = adminClient();
  const { data: conv, error: convErr } = await sb
    .from("conversations")
    .upsert(
      { tenant_id: tenantId, session_key: sessionKey },
      { onConflict: "tenant_id,session_key" },
    )
    .select("id")
    .single();
  if (convErr || !conv?.id) throw convErr ?? new Error("conversation upsert failed");

  const lastUser = messages.filter((m) => m.role === "user").at(-1);
  if (lastUser) {
    await sb.from("messages").insert({
      conversation_id: conv.id,
      role: "user",
      content: lastUser.content,
    });
  }
  await sb.from("messages").insert({
    conversation_id: conv.id,
    role: "assistant",
    content: assistantText || "…",
  });

  await syncLead(sb, tenantId, conv.id, messages, userTurn, assistantText);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const body = await req.json();
    const tenantSlug = String(body.tenantSlug ?? "customer-demo");
    const greeting = Boolean(body.greeting);
    const sessionKey = String(body.sessionKey ?? "anonymous");
    const messages: ChatMsg[] = Array.isArray(body.messages) ? body.messages : [];
    const userTurn =
      typeof body.userTurn === "number"
        ? body.userTurn
        : messages.filter((m) => m.role === "user").length;

    const tenant = await loadTenant(tenantSlug);
    if (!tenant) {
      return Response.json(
        { content: "Компания не найдена. Проверьте ссылку." },
        { status: 404, headers: cors },
      );
    }

    if (greeting) {
      return Response.json({ content: tenant.chat_greeting }, { headers: cors });
    }

    if (messages.length === 0) {
      return Response.json(
        { content: "Отправьте сообщение, чтобы начать диалог." },
        { status: 400, headers: cors },
      );
    }

    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not set in Supabase secrets");
    }

    const kb = tenant.kb_text || Deno.env.get("PRODUCT_KB") || "";
    const hint = stageHint(userTurn);
    const system = `${SYSTEM_BASE}\n\nКомпания: ${tenant.company_name}\n\n--- БАЗА ЗНАНИЙ ---\n${kb}\n\n--- ${hint}`;

    const llmMessages = [
      { role: "system", content: system },
      ...messages
        .filter((m) => m?.role && m?.content)
        .map((m) => ({ role: m.role, content: String(m.content) })),
    ];

    const ds = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: llmMessages,
        temperature: 0.35,
        max_tokens: 800,
      }),
    });

    if (!ds.ok) {
      const errText = await ds.text();
      throw new Error(`DeepSeek ${ds.status}: ${errText}`);
    }

    const data = await ds.json();
    const content = data?.choices?.[0]?.message?.content?.trim() ?? "";

    try {
      await persistChat(tenant.id, sessionKey, messages, content, userTurn);
    } catch (persistErr) {
      console.error("persist:", persistErr);
    }

    return Response.json(
      { content: content || "Пустой ответ модели." },
      { headers: cors },
    );
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json(
      {
        content: "Произошла ошибка сервера. Попробуйте через минуту.",
        debug: msg,
      },
      { status: 500, headers: cors },
    );
  }
});
