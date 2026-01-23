import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateMessageTimestamps1769125236055 implements MigrationInterface {
  name = 'UpdateMessageTimestamps1769125236055';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_message_fromUserId\``);
    await queryRunner.query(`ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_message_toUserId\``);
    await queryRunner.query(`DROP INDEX \`IDX_message_conversationId\` ON \`message\``);
    await queryRunner.query(`DROP INDEX \`IDX_message_createdAt\` ON \`message\``);
    await queryRunner.query(`DROP INDEX \`IDX_message_fromUserId\` ON \`message\``);
    await queryRunner.query(`DROP INDEX \`IDX_message_toUserId\` ON \`message\``);
    await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`createdAtDate\``);
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD \`createdAtDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`createdDate\``);
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`createdDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`interview\` DROP COLUMN \`creationDate\``);
    await queryRunner.query(
      `ALTER TABLE \`interview\` ADD \`creationDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`creationDate\``);
    await queryRunner.query(
      `ALTER TABLE \`application\` ADD \`creationDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`date\``);
    await queryRunner.query(
      `ALTER TABLE \`activity\` ADD \`date\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`email_whitelist\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`email_whitelist\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`readAt\``);
    await queryRunner.query(`ALTER TABLE \`message\` ADD \`readAt\` timestamp NULL`);
    await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_c59262513a3006fd8f58bb4b7c2\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_96789153e31e0bb7885ea13a279\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_96789153e31e0bb7885ea13a279\``
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_c59262513a3006fd8f58bb4b7c2\``
    );
    await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`message\` DROP COLUMN \`readAt\``);
    await queryRunner.query(`ALTER TABLE \`message\` ADD \`readAt\` datetime NULL`);
    await queryRunner.query(`ALTER TABLE \`email_whitelist\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(
      `ALTER TABLE \`email_whitelist\` ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`activity\` DROP COLUMN \`date\``);
    await queryRunner.query(
      `ALTER TABLE \`activity\` ADD \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`application\` DROP COLUMN \`creationDate\``);
    await queryRunner.query(
      `ALTER TABLE \`application\` ADD \`creationDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`interview\` DROP COLUMN \`creationDate\``);
    await queryRunner.query(
      `ALTER TABLE \`interview\` ADD \`creationDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`job\` DROP COLUMN \`createdDate\``);
    await queryRunner.query(
      `ALTER TABLE \`job\` ADD \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`ALTER TABLE \`company\` DROP COLUMN \`createdAtDate\``);
    await queryRunner.query(
      `ALTER TABLE \`company\` ADD \`createdAtDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`
    );
    await queryRunner.query(`CREATE INDEX \`IDX_message_toUserId\` ON \`message\` (\`toUserId\`)`);
    await queryRunner.query(
      `CREATE INDEX \`IDX_message_fromUserId\` ON \`message\` (\`fromUserId\`)`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_message_createdAt\` ON \`message\` (\`createdAt\`)`
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_message_conversationId\` ON \`message\` (\`conversationId\`)`
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_message_toUserId\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE \`message\` ADD CONSTRAINT \`FK_message_fromUserId\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
