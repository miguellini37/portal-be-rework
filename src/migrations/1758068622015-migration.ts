import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1758068622015 implements MigrationInterface {
  name = 'Migration1758068622015';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`activity\` (
                \`activityId\` varchar(36) NOT NULL,
                \`type\` enum ('application', 'interview', 'other') NOT NULL DEFAULT 'other',
                \`message\` text NULL,
                \`date\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                \`applicationId\` varchar(36) NULL,
                \`interviewId\` varchar(36) NULL,
                PRIMARY KEY (\`activityId\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`activity\`
            ADD CONSTRAINT \`FK_3571467bcbe021f66e2bdce96ea\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`activity\`
            ADD CONSTRAINT \`FK_eed75d41cc663dde49f0b84d65f\` FOREIGN KEY (\`applicationId\`) REFERENCES \`application\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`activity\`
            ADD CONSTRAINT \`FK_1ec871667cd35957d136979e31e\` FOREIGN KEY (\`interviewId\`) REFERENCES \`interview\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_1ec871667cd35957d136979e31e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_eed75d41cc663dde49f0b84d65f\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`activity\` DROP FOREIGN KEY \`FK_3571467bcbe021f66e2bdce96ea\`
        `);
    await queryRunner.query(`
            DROP TABLE \`activity\`
        `);
  }
}
