
-- 1. Restrict SELECT on PII tables to managers only
DROP POLICY IF EXISTS "Auth can view pessoas" ON public.pessoas;
CREATE POLICY "Managers can view pessoas" ON public.pessoas
  FOR SELECT TO authenticated USING (public.has_manage_role(auth.uid()));

DROP POLICY IF EXISTS "Auth can view contatos" ON public.pessoas_contatos;
CREATE POLICY "Managers can view contatos" ON public.pessoas_contatos
  FOR SELECT TO authenticated USING (public.has_manage_role(auth.uid()));

DROP POLICY IF EXISTS "Auth can view enderecos" ON public.pessoas_enderecos;
CREATE POLICY "Managers can view enderecos" ON public.pessoas_enderecos
  FOR SELECT TO authenticated USING (public.has_manage_role(auth.uid()));

DROP POLICY IF EXISTS "Auth can view consentimentos" ON public.pessoas_consentimentos;
CREATE POLICY "Managers can view consentimentos" ON public.pessoas_consentimentos
  FOR SELECT TO authenticated USING (public.has_manage_role(auth.uid()));

-- 2. Fix campaign scope NULL bypass: NULL only counts for admins (already covered)
CREATE OR REPLACE FUNCTION public.user_has_campanha_scope(_user_id uuid, _campanha_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM public.user_scopes
    WHERE user_id = _user_id
      AND campanha_id = _campanha_id
  )
$$;

-- 3. Documentos bucket: enforce per-user folder ownership on writes,
--    and restrict listing to owner or managers (bucket remains public for direct URL reads).
DROP POLICY IF EXISTS "Auth read documentos" ON storage.objects;
DROP POLICY IF EXISTS "Auth upload documentos" ON storage.objects;
DROP POLICY IF EXISTS "Auth delete documentos" ON storage.objects;

CREATE POLICY "Documentos: owner or manager can list" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'documentos'
    AND (
      public.has_manage_role(auth.uid())
      OR (storage.foldername(name))[2] = auth.uid()::text
    )
  );

CREATE POLICY "Documentos: users upload to own folder" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documentos'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Documentos: users update own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND ((storage.foldername(name))[2] = auth.uid()::text OR public.has_manage_role(auth.uid()))
  );

CREATE POLICY "Documentos: users delete own or managers any" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'documentos'
    AND ((storage.foldername(name))[2] = auth.uid()::text OR public.has_manage_role(auth.uid()))
  );
