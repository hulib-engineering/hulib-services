import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1736618356589 implements MigrationInterface {
  name = 'CreateTable1736618356589';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "approval" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "approval"`);
  }
}
