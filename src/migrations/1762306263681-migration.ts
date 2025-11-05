import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1762306263681 implements MigrationInterface {
  name = 'Migration1762306263681';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_ee87438803acb531639e8284be\` ON \`company\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_cb3b185eba83efed664a5fdb04\` ON \`school\`
        `);
    await queryRunner.query(`
            CREATE TABLE \`email_whitelist\` (
                \`id\` varchar(36) NOT NULL,
                \`orgId\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`isVerified\` tinyint NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`isVerified\`
        `);
    await queryRunner.query(`
            DROP TABLE \`email_whitelist\`
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_cb3b185eba83efed664a5fdb04\` ON \`school\` (\`ownerId\`)
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_ee87438803acb531639e8284be\` ON \`company\` (\`ownerId\`)
        `);
  }
}
