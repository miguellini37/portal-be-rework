import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755630889819 implements MigrationInterface {
    name = 'Migration1755630889819'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsBasesalarymin\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsBasesalarymax\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsCommissionmin\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsCommissionmax\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsTotalcompmin\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsTotalcompmax\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD \`benefitsSpecificbenefits\` json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsSpecificbenefits\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsTotalcompmax\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsTotalcompmin\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsCommissionmax\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsCommissionmin\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsBasesalarymax\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`company\` DROP COLUMN \`benefitsBasesalarymin\`
        `);
    }

}
