import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1736007592596 implements MigrationInterface {
    name = 'CreateTable1736007592596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "resource" DROP CONSTRAINT "FK_d101cd572a7de19b18812084725"`);
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "permissions_id_seq" OWNED BY "permissions"."id"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "id" SET DEFAULT nextval('"permissions_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "resource" ADD CONSTRAINT "FK_d101cd572a7de19b18812084725" FOREIGN KEY ("idId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "role_permission" DROP CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf"`);
        await queryRunner.query(`ALTER TABLE "resource" DROP CONSTRAINT "FK_d101cd572a7de19b18812084725"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "permissions_id_seq"`);
        await queryRunner.query(`ALTER TABLE "role_permission" ADD CONSTRAINT "FK_e3a3ba47b7ca00fd23be4ebd6cf" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resource" ADD CONSTRAINT "FK_d101cd572a7de19b18812084725" FOREIGN KEY ("idId") REFERENCES "permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
