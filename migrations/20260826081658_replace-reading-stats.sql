DROP TABLE IF EXISTS public.reading_activity;

DROP TABLE IF EXISTS public.user_prefs;

CREATE TABLE public.reading_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_reads INTEGER NOT NULL DEFAULT 0,
  total_verses INTEGER NOT NULL DEFAULT 0,
  total_surahs INTEGER NOT NULL DEFAULT 0,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  last_read_date BIGINT,
  activity JSONB NOT NULL DEFAULT '{}',
  favorite_surahs JSONB NOT NULL DEFAULT '[]',
  streak_days INTEGER NOT NULL DEFAULT 0,
  daily_goal INTEGER NOT NULL DEFAULT 5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.reading_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY reading_stats_owner_select ON public.reading_stats FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY reading_stats_owner_insert ON public.reading_stats FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY reading_stats_owner_update ON public.reading_stats FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY reading_stats_owner_delete ON public.reading_stats FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER reading_stats_set_user_id BEFORE INSERT ON public.reading_stats FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_stats TO authenticated;
