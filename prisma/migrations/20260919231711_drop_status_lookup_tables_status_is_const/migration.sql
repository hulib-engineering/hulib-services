-- `status` is a const value (StatusEnum) stored directly on the owning
-- tables — no lookup table is needed. userStatus/stickerStatus were created
-- during the intermediate split but are now unused (their FKs were dropped in
-- the backup-fk-columns migration), so drop them outright.

DROP TABLE "stickerStatus";
DROP TABLE "userStatus";