import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeviceToken1773000000000 implements MigrationInterface {
  name = 'AddDeviceToken1773000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`device_token\` (
        \`id\` varchar(36) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`token\` varchar(512) NOT NULL,
        \`platform\` varchar(10) NOT NULL DEFAULT 'apns',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        INDEX \`IDX_device_token_userId\` (\`userId\`),
        UNIQUE INDEX \`IDX_device_token_token\` (\`token\`),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_device_token_user\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE
      ) ENGINE = InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`device_token\``);
  }
}
