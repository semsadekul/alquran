CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  NEW.user_id := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  ayah INTEGER NOT NULL,
  surah_name TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookmarks_user_surah_ayah_key UNIQUE (user_id, surah, ayah)
);

CREATE INDEX bookmarks_user_id_idx ON public.bookmarks (user_id);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmarks_owner_select ON public.bookmarks FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY bookmarks_owner_insert ON public.bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY bookmarks_owner_update ON public.bookmarks FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY bookmarks_owner_delete ON public.bookmarks FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER bookmarks_set_user_id BEFORE INSERT ON public.bookmarks FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;

CREATE TABLE public.reading_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  surah INTEGER NOT NULL,
  surah_name TEXT,
  verses INTEGER NOT NULL DEFAULT 0,
  minutes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT reading_activity_user_date_surah_key UNIQUE (user_id, date, surah)
);

CREATE INDEX reading_activity_user_id_idx ON public.reading_activity (user_id);

CREATE INDEX reading_activity_user_date_idx ON public.reading_activity (user_id, date);

ALTER TABLE public.reading_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY reading_activity_owner_select ON public.reading_activity FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY reading_activity_owner_insert ON public.reading_activity FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY reading_activity_owner_update ON public.reading_activity FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY reading_activity_owner_delete ON public.reading_activity FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER reading_activity_set_user_id BEFORE INSERT ON public.reading_activity FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_activity TO authenticated;

CREATE TABLE public.recent_surahs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  last_read TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_ayah INTEGER,
  CONSTRAINT recent_surahs_user_surah_key UNIQUE (user_id, surah)
);

CREATE INDEX recent_surahs_user_id_idx ON public.recent_surahs (user_id);

ALTER TABLE public.recent_surahs ENABLE ROW LEVEL SECURITY;

CREATE POLICY recent_surahs_owner_select ON public.recent_surahs FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY recent_surahs_owner_insert ON public.recent_surahs FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY recent_surahs_owner_update ON public.recent_surahs FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY recent_surahs_owner_delete ON public.recent_surahs FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER recent_surahs_set_user_id BEFORE INSERT ON public.recent_surahs FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recent_surahs TO authenticated;

CREATE TABLE public.hifz_memorized (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  ayah INTEGER NOT NULL,
  memorized_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hifz_memorized_user_surah_ayah_key UNIQUE (user_id, surah, ayah)
);

CREATE INDEX hifz_memorized_user_id_idx ON public.hifz_memorized (user_id);

ALTER TABLE public.hifz_memorized ENABLE ROW LEVEL SECURITY;

CREATE POLICY hifz_memorized_owner_select ON public.hifz_memorized FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_memorized_owner_insert ON public.hifz_memorized FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_memorized_owner_update ON public.hifz_memorized FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_memorized_owner_delete ON public.hifz_memorized FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER hifz_memorized_set_user_id BEFORE INSERT ON public.hifz_memorized FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_memorized TO authenticated;

CREATE TABLE public.hifz_revision (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  ayah INTEGER NOT NULL,
  revised_at DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT hifz_revision_user_surah_ayah_key UNIQUE (user_id, surah, ayah)
);

CREATE INDEX hifz_revision_user_id_idx ON public.hifz_revision (user_id);

ALTER TABLE public.hifz_revision ENABLE ROW LEVEL SECURITY;

CREATE POLICY hifz_revision_owner_select ON public.hifz_revision FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_revision_owner_insert ON public.hifz_revision FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_revision_owner_update ON public.hifz_revision FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_revision_owner_delete ON public.hifz_revision FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER hifz_revision_set_user_id BEFORE INSERT ON public.hifz_revision FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_revision TO authenticated;

CREATE TABLE public.hifz_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hifz_achievements_user_achievement_key UNIQUE (user_id, achievement)
);

CREATE INDEX hifz_achievements_user_id_idx ON public.hifz_achievements (user_id);

ALTER TABLE public.hifz_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY hifz_achievements_owner_select ON public.hifz_achievements FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_achievements_owner_insert ON public.hifz_achievements FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_achievements_owner_update ON public.hifz_achievements FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_achievements_owner_delete ON public.hifz_achievements FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER hifz_achievements_set_user_id BEFORE INSERT ON public.hifz_achievements FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_achievements TO authenticated;

CREATE TABLE public.hifz_ayah_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surah INTEGER NOT NULL,
  ayah INTEGER NOT NULL,
  practice_count INTEGER NOT NULL DEFAULT 0,
  mastered BOOLEAN NOT NULL DEFAULT FALSE,
  last_practiced TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT hifz_ayah_progress_user_surah_ayah_key UNIQUE (user_id, surah, ayah)
);

CREATE INDEX hifz_ayah_progress_user_id_idx ON public.hifz_ayah_progress (user_id);

ALTER TABLE public.hifz_ayah_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY hifz_ayah_progress_owner_select ON public.hifz_ayah_progress FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_ayah_progress_owner_insert ON public.hifz_ayah_progress FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_ayah_progress_owner_update ON public.hifz_ayah_progress FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY hifz_ayah_progress_owner_delete ON public.hifz_ayah_progress FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER hifz_ayah_progress_set_user_id BEFORE INSERT ON public.hifz_ayah_progress FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_ayah_progress TO authenticated;

CREATE TABLE public.user_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_goal INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_prefs_owner_select ON public.user_prefs FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY user_prefs_owner_insert ON public.user_prefs FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY user_prefs_owner_update ON public.user_prefs FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY user_prefs_owner_delete ON public.user_prefs FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER user_prefs_set_user_id BEFORE INSERT ON public.user_prefs FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_prefs TO authenticated;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
