CREATE TABLE public.site_content (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site content is publicly readable" ON public.site_content FOR SELECT USING (true);
INSERT INTO public.site_content (id, data) VALUES ('singleton', '{}'::jsonb);
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;