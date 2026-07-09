
-- Lock down has_role: revoke public/anon EXECUTE, keep authenticated for RLS
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- Tighten the always-true INSERT policy on requests
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.requests;
CREATE POLICY "Anyone can submit a request"
ON public.requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'Pending'
  AND admin_notes IS NULL
  AND length(btrim(client_name)) BETWEEN 1 AND 200
  AND length(btrim(request_details)) BETWEEN 1 AND 5000
  AND (email IS NULL OR length(email) <= 320)
  AND (phone IS NULL OR length(phone) <= 40)
);
