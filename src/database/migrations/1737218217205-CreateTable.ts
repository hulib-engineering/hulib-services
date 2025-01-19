import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1737218217205 implements MigrationInterface {
  name = 'CreateTable1737218217205';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "story" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "abstract" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "coverId" uuid, "humanBookId" integer, CONSTRAINT "UQ_652b018f49a71d11bf3660910e1" UNIQUE ("title"), CONSTRAINT "REL_7b3dca92ca9177cfa8b9cc2828" UNIQUE ("coverId"), CONSTRAINT "PK_28fce6873d61e2cace70a0f3361" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_7b3dca92ca9177cfa8b9cc28288" FOREIGN KEY ("coverId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" ADD CONSTRAINT "FK_b9fc94a13b9222e4a40a34ac546" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_b9fc94a13b9222e4a40a34ac546"`,
    );
    await queryRunner.query(
      `ALTER TABLE "story" DROP CONSTRAINT "FK_7b3dca92ca9177cfa8b9cc28288"`,
    );
    await queryRunner.query(`DROP TABLE "story"`);
  }
}
