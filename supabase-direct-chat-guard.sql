-- One-time migration for existing Supabase projects.
-- Adds a unique key for 1-on-1 rooms so the same two users can only have one direct chat.
-- Run after cleaning duplicate rooms, or run supabase-launch-reset.sql first for a clean launch.

ALTER TABLE chat_rooms_kriptografi
  ADD COLUMN IF NOT EXISTS direct_pair_key TEXT;

WITH direct_rooms AS (
  SELECT
    room_id,
    string_agg(user_id::text, ':' ORDER BY user_id::text) AS pair_key
  FROM room_members_kriptografi
  GROUP BY room_id
  HAVING COUNT(DISTINCT user_id) = 2
),
ranked_direct_rooms AS (
  SELECT
    direct_rooms.room_id,
    direct_rooms.pair_key,
    ROW_NUMBER() OVER (
      PARTITION BY direct_rooms.pair_key
      ORDER BY chat_rooms_kriptografi.updated_at DESC, chat_rooms_kriptografi.created_at DESC
    ) AS room_rank
  FROM direct_rooms
  JOIN chat_rooms_kriptografi ON chat_rooms_kriptografi.id = direct_rooms.room_id
)
DELETE FROM chat_rooms_kriptografi
USING ranked_direct_rooms
WHERE chat_rooms_kriptografi.id = ranked_direct_rooms.room_id
  AND ranked_direct_rooms.room_rank > 1;

WITH direct_rooms AS (
  SELECT
    room_id,
    string_agg(user_id::text, ':' ORDER BY user_id::text) AS pair_key
  FROM room_members_kriptografi
  GROUP BY room_id
  HAVING COUNT(DISTINCT user_id) = 2
)
UPDATE chat_rooms_kriptografi
SET direct_pair_key = direct_rooms.pair_key
FROM direct_rooms
WHERE chat_rooms_kriptografi.id = direct_rooms.room_id
  AND chat_rooms_kriptografi.direct_pair_key IS DISTINCT FROM direct_rooms.pair_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_rooms_direct_pair_key_unique
  ON chat_rooms_kriptografi(direct_pair_key)
  WHERE direct_pair_key IS NOT NULL;
