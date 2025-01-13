import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUser1736609857024 implements MigrationInterface {
  name = 'UpdateUser1736609857024';

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
