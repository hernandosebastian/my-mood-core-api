import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1740194321182 implements MigrationInterface {
  name = 'InitialSchema1740194321182';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`track\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` varchar(255) NULL, \`date\` datetime NOT NULL, \`fk_owner_id\` int NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`nickname\` varchar(255) NOT NULL, \`avatar_src\` varchar(255) NOT NULL, \`external_id\` varchar(255) NULL, \`roles\` text NOT NULL, \`is_verified\` tinyint NOT NULL DEFAULT 0, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` datetime(6) NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e2364281027b926b879fa2fa1e\` (\`nickname\`), UNIQUE INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` (\`external_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`track\` ADD CONSTRAINT \`FK_d6b0b508a7c4cebcb80567eacb6\` FOREIGN KEY (\`fk_owner_id\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`track\` DROP FOREIGN KEY \`FK_d6b0b508a7c4cebcb80567eacb6\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_d9479cbc9c65660b7cf9b65795\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e2364281027b926b879fa2fa1e\` ON \`user\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``,
    );
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`track\``);
  }
}
