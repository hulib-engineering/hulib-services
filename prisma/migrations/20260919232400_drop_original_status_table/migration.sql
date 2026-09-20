-- `status` is a const value (StatusEnum) stored directly as a plain column on
-- user/sticker; no lookup table is kept. The backup-fk-columns migration
-- already dropped the FK constraints that pointed here (user_statusId_fkey,
-- sticker_statusId_fkey), so the original table can now be dropped.
DROP TABLE "status";