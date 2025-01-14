import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1736789571214 implements MigrationInterface {
  name = 'CreateTable1736789571214';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "parentPhoneNumber" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "phoneNumber" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "parentPhoneNumber"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
  }
}
