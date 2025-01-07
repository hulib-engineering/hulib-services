import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTable1736263889677 implements MigrationInterface {
  name = 'CreateTable1736263889677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resource" DROP CONSTRAINT "FK_d101cd572a7de19b18812084725"`,
    );
    await queryRunner.query(`ALTER TABLE "resource" DROP COLUMN "idId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "resource" ADD "idId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "resource" ADD CONSTRAINT "FK_d101cd572a7de19b18812084725" FOREIGN KEY ("idId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
