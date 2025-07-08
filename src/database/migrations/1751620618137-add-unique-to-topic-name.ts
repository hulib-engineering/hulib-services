import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueToTopicName1751620618137 implements MigrationInterface {
  name = 'AddUniqueToTopicName1751620618137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topics" ADD CONSTRAINT "UQ_1304b1c61016e63f60cd147ce6b" UNIQUE ("name")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topics" ADD CONSTRAINT "UQ_1304b1c61016e63f60cd147ce6b" UNIQUE ("name")`,
    );
  }
}
