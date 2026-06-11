-- Один lead на диалог чата
CREATE UNIQUE INDEX IF NOT EXISTS leads_conversation_uidx
  ON public.leads (conversation_id)
  WHERE conversation_id IS NOT NULL;
