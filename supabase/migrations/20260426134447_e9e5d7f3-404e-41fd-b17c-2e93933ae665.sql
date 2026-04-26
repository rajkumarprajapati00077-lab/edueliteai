
-- Audiobooks table
CREATE TABLE public.audiobooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course text NOT NULL DEFAULT 'CA',
  level text NOT NULL DEFAULT 'Foundation',
  subject text NOT NULL DEFAULT 'General',
  chapter text NOT NULL DEFAULT 'Chapter 1',
  title text NOT NULL,
  summary text,
  key_points jsonb DEFAULT '[]'::jsonb,
  source_pdf_path text,
  audio_path text,
  voice text DEFAULT 'female',
  language text DEFAULT 'en',
  duration_seconds integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.audiobooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audiobooks own select" ON public.audiobooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "audiobooks own insert" ON public.audiobooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "audiobooks own update" ON public.audiobooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "audiobooks own delete" ON public.audiobooks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER audiobooks_touch BEFORE UPDATE ON public.audiobooks
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_audiobooks_user ON public.audiobooks(user_id, created_at DESC);

-- Progress / bookmarks
CREATE TABLE public.audiobook_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  audiobook_id uuid NOT NULL REFERENCES public.audiobooks(id) ON DELETE CASCADE,
  position_seconds integer NOT NULL DEFAULT 0,
  bookmarks jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, audiobook_id)
);

ALTER TABLE public.audiobook_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abp own select" ON public.audiobook_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "abp own insert" ON public.audiobook_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "abp own update" ON public.audiobook_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "abp own delete" ON public.audiobook_progress FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER abp_touch BEFORE UPDATE ON public.audiobook_progress
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Storage bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('audiobooks', 'audiobooks', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "audiobooks bucket owner select" ON storage.objects FOR SELECT
  USING (bucket_id = 'audiobooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "audiobooks bucket owner insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'audiobooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "audiobooks bucket owner update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'audiobooks' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "audiobooks bucket owner delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'audiobooks' AND auth.uid()::text = (storage.foldername(name))[1]);
