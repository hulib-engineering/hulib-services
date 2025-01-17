import { MigrationInterface, QueryRunner } from 'typeorm';
export class Init1737047825910 implements MigrationInterface {
  name = 'Init1737047825910';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
            CREATE TABLE IF NOT EXISTS file
            (
                id   uuid DEFAULT uuid_generate_v4() NOT NULL
                    CONSTRAINT file_pkey
                        PRIMARY KEY,
                path varchar                         NOT NULL
            );
            CREATE TABLE IF NOT EXISTS gender
            (
                id   integer NOT NULL
                    CONSTRAINT gender_pkey
                        PRIMARY KEY,
                name varchar NOT NULL
            );
            CREATE TABLE IF NOT EXISTS role
            (
                id   integer NOT NULL
                    CONSTRAINT role_pkey
                        PRIMARY KEY,
                name varchar NOT NULL
            );
            CREATE SEQUENCE public.session_id_seq;
            CREATE TABLE IF NOT EXISTS session
            (
                id          integer DEFAULT NEXTVAL('session_id_seq'::regclass) NOT NULL
                    CONSTRAINT session_pkey
                        PRIMARY KEY,
                hash        varchar                                             NOT NULL,
                "createdAt" time    DEFAULT NOW()                               NOT NULL,
                "updatedAt" time    DEFAULT NOW()                               NOT NULL,
                "deletedAt" time,
                "userId"    integer
            );
            CREATE TABLE IF NOT EXISTS status
            (
                id   integer NOT NULL
                    CONSTRAINT status_pkey
                        PRIMARY KEY,
                name varchar NOT NULL
            );
            CREATE SEQUENCE public.user_id_seq;
            CREATE TABLE IF NOT EXISTS "user"
            (
                id                  integer DEFAULT NEXTVAL('user_id_seq'::regclass) NOT NULL
                    CONSTRAINT user_pkey
                        PRIMARY KEY,
                email               varchar,
                password            varchar,
                provider            varchar DEFAULT 'email'::character varying       NOT NULL,
                "socialId"          varchar,
                "fullName"          varchar,
                birthday            varchar,
                "createdAt"         time    DEFAULT NOW()                            NOT NULL,
                "updatedAt"         time    DEFAULT NOW()                            NOT NULL,
                "deletedAt"         time,
                "genderId"          integer
                    CONSTRAINT "user_genderId_fkey"
                        REFERENCES gender,
                "roleId"            integer
                    CONSTRAINT "user_roleId_fkey"
                        REFERENCES role,
                "statusId"          integer
                    CONSTRAINT "user_statusId_fkey"
                        REFERENCES status,
                approval            varchar,
                "photoId"           uuid
                    CONSTRAINT "user_photoId_fkey"
                        REFERENCES file,
                address             varchar,
                "parentPhoneNumber" varchar,
                "phoneNumber"       varchar,
                bio                 varchar,
                "videoUrl"          varchar,
                education           varchar,
                "educationStart"    date,
                "educationEnd"      date
            );
            CREATE TABLE IF NOT EXISTS "humanBooks"
            (
                id               serial
                    CONSTRAINT "humanBooks_pkey"
                        PRIMARY KEY,
                "userId"         integer                             NOT NULL
                    CONSTRAINT fk_human_books_user
                        REFERENCES "user"
                        ON DELETE CASCADE,
                bio              varchar,
                "videoUrl"       varchar,
                education        varchar,
                "educationStart" date,
                "educationEnd"   date,
                "createdAt"      timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt"      timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
            CREATE TABLE IF NOT EXISTS topics
            (
                id          serial
                    CONSTRAINT topics_pkey
                        PRIMARY KEY,
                name        varchar                             NOT NULL,
                "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
                "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
            CREATE TABLE IF NOT EXISTS "humanBook_sharing_topic"
            (
                "userId"   integer NOT NULL
                    CONSTRAINT fk_user
                        REFERENCES "user"
                        ON DELETE CASCADE,
                "topicsId" integer NOT NULL
                    CONSTRAINT fk_topics
                        REFERENCES topics
                        ON DELETE CASCADE,
                CONSTRAINT "humanBook_sharing_topic_pkey"
                    PRIMARY KEY ("userId", "topicsId")
            );
            `);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "humanBook_sharing_topic"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "humanBooks"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "topics"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "status"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "gender"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "file"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "session"`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "session_id_seq"`);
    await queryRunner.query(`DROP SEQUENCE IF EXISTS "user_id_seq"`);
  }
}
