import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755270023896 implements MigrationInterface {
    name = 'Migration1755270023896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsBasesalary\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsCommission\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsTotalcomp\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsHealthwellness\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsFlexiblescheduling\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsCareerdevelopment\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsNilopportunities\` json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsNilopportunities\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsCareerdevelopment\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsFlexiblescheduling\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsHealthwellness\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsTotalcomp\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsCommission\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsBasesalary\`
        `);
    }

}
