import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTable1737031485338 implements MigrationInterface {
    name = 'InitTable1737031485338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "topics" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "humanBook_sharing_topic" ("topicsId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_6209cedec01a72e3f68754509fa" PRIMARY KEY ("topicsId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_071cf1eb4bbc181137ab3eabcb" ON "humanBook_sharing_topic" ("topicsId") `);
        await queryRunner.query(`CREATE INDEX "IDX_0f1178a3bb4ed7248da5380b23" ON "humanBook_sharing_topic" ("userId") `);
        await queryRunner.query(`ALTER TABLE "user" ADD "approval" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "bio" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "videoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "education" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "educationStart" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user" ADD "educationEnd" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "humanBook_sharing_topic" ADD CONSTRAINT "FK_071cf1eb4bbc181137ab3eabcb1" FOREIGN KEY ("topicsId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "humanBook_sharing_topic" ADD CONSTRAINT "FK_0f1178a3bb4ed7248da5380b232" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "humanBook_sharing_topic" DROP CONSTRAINT "FK_0f1178a3bb4ed7248da5380b232"`);
        await queryRunner.query(`ALTER TABLE "humanBook_sharing_topic" DROP CONSTRAINT "FK_071cf1eb4bbc181137ab3eabcb1"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "educationEnd"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "educationStart"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "education"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "videoUrl"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "bio"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "approval"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0f1178a3bb4ed7248da5380b23"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_071cf1eb4bbc181137ab3eabcb"`);
        await queryRunner.query(`DROP TABLE "humanBook_sharing_topic"`);
        await queryRunner.query(`DROP TABLE "topics"`);
    }

}
