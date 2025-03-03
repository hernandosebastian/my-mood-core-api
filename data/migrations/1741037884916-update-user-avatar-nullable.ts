import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserAvatarNullable1741037884916
  implements MigrationInterface
{
  name = 'UpdateUserAvatarNullable1741037884916';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`avatar_src\` varchar(255) NULL`,
    );
    await queryRunner.query(`UPDATE \`user\` SET \`avatar_src\` = NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`user\` SET \`avatar_src\` = ''`);
    await queryRunner.query(
      `ALTER TABLE \`user\` MODIFY COLUMN \`avatar_src\` varchar(255) NOT NULL`,
    );
  }
}
