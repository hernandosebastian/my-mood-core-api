import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserIsVerified1714407834514 implements MigrationInterface {
  name = 'UserIsVerified1714407834514';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`is_verified\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`is_verified\``);
  }
}
