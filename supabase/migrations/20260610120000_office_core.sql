-- AIKIVAVIORA Office: tenant, 3 roles, leads, conversations

CREATE TYPE public.staff_role AS ENUM ('director', 'manager', 'admin');

CREATE TABLE public.tenants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  company_name  text NOT NULL,
  chat_greeting text NOT NULL,
  contact_email text,
  contact_phone text,
  site_url      text,
  kb_text       text NOT NULL DEFAULT '',
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  email      text,
  full_name  text,
  role       public.staff_role NOT NULL DEFAULT 'manager',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX profiles_tenant_idx ON public.profiles (tenant_id);

CREATE OR REPLACE FUNCTION public.user_role()
RETURNS public.staff_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_tenant uuid;
BEGIN
  SELECT id INTO default_tenant FROM public.tenants WHERE slug = 'customer-demo' LIMIT 1;
  IF default_tenant IS NULL THEN
    RAISE EXCEPTION 'Tenant customer-demo not found. Run seed first.';
  END IF;

  INSERT INTO public.profiles (id, tenant_id, email, full_name, role)
  VALUES (
    NEW.id,
    default_tenant,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(COALESCE(NEW.email, ''), '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.staff_role, 'manager')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  conversation_id uuid,
  name            text,
  phone           text,
  email           text,
  need_summary    text,
  budget_range    text,
  recommended     text,
  status          text NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'contacted', 'qualified', 'won', 'lost')),
  assigned_to     uuid REFERENCES public.profiles(id),
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX leads_tenant_idx ON public.leads (tenant_id);

CREATE TABLE public.conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  session_key text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX conversations_session_idx ON public.conversations (tenant_id, session_key);

CREATE TABLE public.messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content         text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON public.messages (conversation_id);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- tenants: staff read own tenant; public read active slug via anon limited policy
CREATE POLICY "tenants: staff read own"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (id = public.user_tenant_id());

CREATE POLICY "tenants: anon read active by slug"
  ON public.tenants FOR SELECT
  TO anon
  USING (is_active = true);

CREATE POLICY "tenants: admin update own"
  ON public.tenants FOR UPDATE
  TO authenticated
  USING (id = public.user_tenant_id() AND public.user_role() = 'admin')
  WITH CHECK (id = public.user_tenant_id() AND public.user_role() = 'admin');

-- profiles
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles: admin read tenant"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.user_tenant_id()
    AND public.user_role() = 'admin'
  );

-- leads
CREATE POLICY "leads: manager own"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.user_tenant_id()
    AND public.user_role() = 'manager'
    AND (assigned_to = auth.uid() OR assigned_to IS NULL)
  );

CREATE POLICY "leads: manager update own"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    tenant_id = public.user_tenant_id()
    AND public.user_role() = 'manager'
    AND (assigned_to = auth.uid() OR assigned_to IS NULL)
  )
  WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY "leads: director read tenant"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.user_tenant_id()
    AND public.user_role() = 'director'
  );

CREATE POLICY "leads: admin all tenant"
  ON public.leads FOR ALL
  TO authenticated
  USING (
    tenant_id = public.user_tenant_id()
    AND public.user_role() = 'admin'
  )
  WITH CHECK (tenant_id = public.user_tenant_id());

-- conversations / messages: staff read tenant
CREATE POLICY "conversations: staff read"
  ON public.conversations FOR SELECT
  TO authenticated
  USING (tenant_id = public.user_tenant_id());

CREATE POLICY "messages: staff read"
  ON public.messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM public.conversations
      WHERE tenant_id = public.user_tenant_id()
    )
  );
