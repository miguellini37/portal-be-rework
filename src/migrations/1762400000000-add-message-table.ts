import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageTable1762400000000 implements MigrationInterface {
  name = 'AddMessageTable1762400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`message\` (
                \`id\` varchar(36) NOT NULL,
                \`conversationId\` varchar(255) NOT NULL,
                \`fromUserId\` varchar(255) NOT NULL,
                \`toUserId\` varchar(255) NOT NULL,
                \`message\` text NOT NULL,
                \`readAt\` datetime NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_message_fromUserId\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_message_toUserId\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            CREATE INDEX \`IDX_message_conversationId\` ON \`message\` (\`conversationId\`)
        `);
    await queryRunner.query(`
            CREATE INDEX \`IDX_message_fromUserId\` ON \`message\` (\`fromUserId\`)
        `);
    await queryRunner.query(`
            CREATE INDEX \`IDX_message_toUserId\` ON \`message\` (\`toUserId\`)
        `);
    await queryRunner.query(`
            CREATE INDEX \`IDX_message_createdAt\` ON \`message\` (\`createdAt\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_message_createdAt\` ON \`message\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_message_toUserId\` ON \`message\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_message_fromUserId\` ON \`message\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_message_conversationId\` ON \`message\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_message_toUserId\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_message_fromUserId\`
        `);
    await queryRunner.query(`
            DROP TABLE \`message\`
        `);
  }
}
