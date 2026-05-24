-- CipherVault launch reset
-- Run this in Supabase SQL Editor when you want a clean launch database.
-- Default reset keeps users and removes only chat rooms, members, messages, and recipients.
--
-- NOTE: Supabase does not allow direct DELETE from storage.objects via SQL.
-- To clear uploaded files, go to Supabase Dashboard > Storage > chat-files-kriptografi
-- and delete the files manually (select all > delete).

BEGIN;

TRUNCATE TABLE
  message_recipients_kriptografi,
  messages_kriptografi,
  room_members_kriptografi,
  chat_rooms_kriptografi
RESTART IDENTITY CASCADE;

COMMIT;

-- Optional full wipe, including app users.
-- Uncomment only if you want everyone to register/login fresh again.
--
-- BEGIN;
--
-- TRUNCATE TABLE
--   message_recipients_kriptografi,
--   messages_kriptografi,
--   room_members_kriptografi,
--   chat_rooms_kriptografi,
--   users_kriptografi
-- RESTART IDENTITY CASCADE;
--
-- COMMIT;
