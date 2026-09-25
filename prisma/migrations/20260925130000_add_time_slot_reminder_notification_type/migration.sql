INSERT INTO "notificationType" ("name") VALUES ('timeSlotReminder') ON CONFLICT ("name") DO NOTHING;
