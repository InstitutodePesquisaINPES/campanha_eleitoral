
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = on) AS
  SELECT id, user_id, full_name, avatar_url
  FROM public.profiles;
