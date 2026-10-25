-- Bookmark folders + notes, and SM-2 scheduling state for Hifz review.
--
-- Everything stays owner-scoped through RLS: folders carry user_id directly,
-- bookmarks keep their existing column and gain a folder reference that is
-- verified against the same owner before it is written.

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

-- ─── Bookmark folders ────────────────────────────────────────────────

CREATE TABLE public.bookmark_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  color TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT bookmark_folders_user_name_key UNIQUE (user_id, name)
);

CREATE INDEX bookmark_folders_user_id_idx ON public.bookmark_folders (user_id);

ALTER TABLE public.bookmark_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY bookmark_folders_owner_select ON public.bookmark_folders FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE POLICY bookmark_folders_owner_insert ON public.bookmark_folders FOR INSERT TO authenticated WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY bookmark_folders_owner_update ON public.bookmark_folders FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY bookmark_folders_owner_delete ON public.bookmark_folders FOR DELETE TO authenticated USING (user_id = (SELECT auth.uid()));

CREATE TRIGGER bookmark_folders_set_user_id BEFORE INSERT ON public.bookmark_folders FOR EACH ROW EXECUTE FUNCTION public.set_user_id();

CREATE TRIGGER bookmark_folders_touch_updated_at BEFORE UPDATE ON public.bookmark_folders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmark_folders TO authenticated;

-- ─── Bookmark notes + folder assignment ──────────────────────────────

ALTER TABLE public.bookmarks
  ADD COLUMN folder_id UUID REFERENCES public.bookmark_folders(id) ON DELETE SET NULL,
  ADD COLUMN note TEXT,
  ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX bookmarks_folder_id_idx ON public.bookmarks (folder_id);

CREATE INDEX bookmarks_user_added_at_idx ON public.bookmarks (user_id, added_at DESC);

CREATE TRIGGER bookmarks_touch_updated_at BEFORE UPDATE ON public.bookmarks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- The folder foreign key alone would let a row point at someone else's folder.
-- Cross-check ownership before the row lands.
CREATE OR REPLACE FUNCTION public.assert_bookmark_folder_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  -- Triggers fire in name order, so this may run before bookmarks_set_user_id;
  -- resolve the owner here rather than depending on that ordering.
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;

  IF NEW.folder_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.bookmark_folders
    WHERE id = NEW.folder_id AND user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'bookmark folder % is not owned by this user', NEW.folder_id
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookmarks_assert_folder_owner BEFORE INSERT OR UPDATE ON public.bookmarks FOR EACH ROW EXECUTE FUNCTION public.assert_bookmark_folder_owner();

-- ─── SM-2 scheduling state ───────────────────────────────────────────

ALTER TABLE public.hifz_ayah_progress
  ADD COLUMN ease_factor REAL NOT NULL DEFAULT 2.5 CHECK (ease_factor >= 1.3),
  ADD COLUMN interval_days INTEGER NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  ADD COLUMN repetitions INTEGER NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  ADD COLUMN due_date DATE,
  ADD COLUMN last_reviewed TIMESTAMPTZ;

CREATE INDEX hifz_ayah_progress_due_idx ON public.hifz_ayah_progress (user_id, due_date);
