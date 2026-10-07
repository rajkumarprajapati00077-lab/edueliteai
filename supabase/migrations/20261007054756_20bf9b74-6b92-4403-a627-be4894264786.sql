CREATE TABLE public.copy_checks (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, paper text NOT NULL, result text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT ON public.copy_checks TO authenticated;
GRANT ALL ON public.copy_checks TO service_role;
ALTER TABLE public.copy_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own copy checks read" ON public.copy_checks FOR SELECT TO authenticated USING (auth.uid() = user_id);