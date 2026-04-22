
-- 1. Bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('tarefa-documentos', 'tarefa-documentos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Tabela de anexos por tarefa
CREATE TABLE IF NOT EXISTS public.campanha_tarefa_anexos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id uuid NOT NULL REFERENCES public.campanha_tarefas(id) ON DELETE CASCADE,
  campanha_id uuid NOT NULL REFERENCES public.campanhas(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  descricao text,
  tipo_documento text DEFAULT 'outros',
  storage_path text NOT NULL,
  arquivo_nome text,
  arquivo_tamanho bigint,
  mime_type text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  pessoas_anexo_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarefa_anexos_tarefa ON public.campanha_tarefa_anexos(tarefa_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_anexos_campanha ON public.campanha_tarefa_anexos(campanha_id);

ALTER TABLE public.campanha_tarefa_anexos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tarefa_anexos_select_scope" ON public.campanha_tarefa_anexos
  FOR SELECT TO authenticated
  USING (public.user_has_campanha_scope(auth.uid(), campanha_id));

CREATE POLICY "tarefa_anexos_insert_scope" ON public.campanha_tarefa_anexos
  FOR INSERT TO authenticated
  WITH CHECK (public.user_has_campanha_scope(auth.uid(), campanha_id));

CREATE POLICY "tarefa_anexos_update_scope" ON public.campanha_tarefa_anexos
  FOR UPDATE TO authenticated
  USING (public.user_has_campanha_scope(auth.uid(), campanha_id));

CREATE POLICY "tarefa_anexos_delete_scope" ON public.campanha_tarefa_anexos
  FOR DELETE TO authenticated
  USING (public.user_has_campanha_scope(auth.uid(), campanha_id));

CREATE TRIGGER trg_tarefa_anexos_updated_at
  BEFORE UPDATE ON public.campanha_tarefa_anexos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. RLS do bucket: path = <campanha_id>/<tarefa_id>/<file>
CREATE POLICY "tarefa_docs_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'tarefa-documentos'
    AND public.user_has_campanha_scope(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "tarefa_docs_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'tarefa-documentos'
    AND public.user_has_campanha_scope(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "tarefa_docs_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'tarefa-documentos'
    AND public.user_has_campanha_scope(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

CREATE POLICY "tarefa_docs_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'tarefa-documentos'
    AND public.user_has_campanha_scope(auth.uid(), ((storage.foldername(name))[1])::uuid)
  );

-- 4. Trigger: espelha anexo de tarefa em pessoas_anexos (módulo Documentos central)
CREATE OR REPLACE FUNCTION public.tg_tarefa_anexo_espelha_documento()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_url text; v_pessoa_id uuid;
BEGIN
  -- usa o uploader como pessoa_id "guarda-chuva" (módulo aceita user_id)
  v_pessoa_id := COALESCE(NEW.uploaded_by, auth.uid());
  v_url := NEW.storage_path; -- guardamos o path; o módulo já tem código para signed URL

  INSERT INTO public.pessoas_anexos (pessoa_id, arquivo_url, tipo_documento, descricao)
  VALUES (
    v_pessoa_id,
    v_url,
    COALESCE(NEW.tipo_documento, 'outros'),
    '[Tarefa] ' || NEW.titulo || COALESCE(' · ' || NEW.descricao, '')
  )
  RETURNING id INTO NEW.pessoas_anexo_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tarefa_anexo_espelha
  BEFORE INSERT ON public.campanha_tarefa_anexos
  FOR EACH ROW EXECUTE FUNCTION public.tg_tarefa_anexo_espelha_documento();

-- limpa espelho quando o anexo é removido
CREATE OR REPLACE FUNCTION public.tg_tarefa_anexo_remove_espelho()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.pessoas_anexo_id IS NOT NULL THEN
    DELETE FROM public.pessoas_anexos WHERE id = OLD.pessoas_anexo_id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE TRIGGER trg_tarefa_anexo_remove_espelho
  AFTER DELETE ON public.campanha_tarefa_anexos
  FOR EACH ROW EXECUTE FUNCTION public.tg_tarefa_anexo_remove_espelho();

-- 5. Atualizar campanha Kiribamba: início 19/04/2026 e regenerar plano com novas tarefas iniciais
UPDATE public.campanhas
SET data_inicio_plano = '2026-04-19'
WHERE nome ILIKE '%kiribamba%';
