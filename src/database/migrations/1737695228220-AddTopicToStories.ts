import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTopicToStories1737695228220 implements MigrationInterface {
  name = 'AddTopicToStories1737695228220';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "story_topic" ("storyId" integer NOT NULL, "topicsId" integer NOT NULL, CONSTRAINT "PK_daac5f6e136323af79f078f8fb2" PRIMARY KEY ("storyId", "topicsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b537f83752d0f81070ba710f0b" ON "story_topic" ("storyId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dbd95901116ef9dee7b132c1b0" ON "story_topic" ("topicsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "story_topic" ADD CONSTRAINT "FK_b537f83752d0f81070ba710f0b5" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_topic" ADD CONSTRAINT "FK_dbd95901116ef9dee7b132c1b04" FOREIGN KEY ("topicsId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story_topic" DROP CONSTRAINT "FK_dbd95901116ef9dee7b132c1b04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story_topic" DROP CONSTRAINT "FK_b537f83752d0f81070ba710f0b5"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dbd95901116ef9dee7b132c1b0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b537f83752d0f81070ba710f0b"`,
    );
    await queryRunner.query(`DROP TABLE "story_topic"`);
  }
}
