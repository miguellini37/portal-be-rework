import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1756665053155 implements MigrationInterface {
  name = 'Migration1756665053155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_981cc89a6e49d019d81b4a98f6f\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`recruiting\` json NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD \`status\` enum (
                    'applied',
                    'under_review',
                    'interview_requested',
                    'accepted',
                    'rejected',
                    'withdrawn'
                ) NOT NULL DEFAULT 'applied'
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_981cc89a6e49d019d81b4a98f6f\` FOREIGN KEY (\`companyRefId\`) REFERENCES \`company\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_981cc89a6e49d019d81b4a98f6f\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\` DROP COLUMN \`status\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`recruiting\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_981cc89a6e49d019d81b4a98f6f\` FOREIGN KEY (\`companyRefId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
