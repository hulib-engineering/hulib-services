import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1736567148788 implements MigrationInterface {
  name = 'CreateTable1736567148788';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gender" RENAME COLUMN "name" TO "content"`,
    );
    await queryRunner.query(
      `CREATE TABLE "books" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "abstract" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "authorId" integer NOT NULL, "tagId" integer, CONSTRAINT "PK_f3f2f25a099d24e12545b70b022" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "gender" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "approval"`);
    await queryRunner.query(
      `ALTER TABLE "gender" ADD "name" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "gender" ADD "content" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_54f49efe2dd4d2850e736e9ab86" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" ADD CONSTRAINT "FK_91f363ad3bb69af5dc127e24cfd" FOREIGN KEY ("tagId") REFERENCES "gender"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_91f363ad3bb69af5dc127e24cfd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "books" DROP CONSTRAINT "FK_54f49efe2dd4d2850e736e9ab86"`,
    );
    await queryRunner.query(`ALTER TABLE "gender" DROP COLUMN "content"`);
    await queryRunner.query(`ALTER TABLE "gender" DROP COLUMN "name"`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "approval" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "gender" ADD "content" character varying NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(
      `ALTER TABLE "gender" RENAME COLUMN "content" TO "name"`,
    );
  }
}
