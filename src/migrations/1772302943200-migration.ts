import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1772302943200 implements MigrationInterface {
  name = 'Migration1772302943200';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`company\` (
                \`id\` varchar(36) NOT NULL,
                \`companyName\` varchar(255) NULL,
                \`industry\` varchar(255) NULL,
                \`recruiting\` json NULL,
                \`createdAtDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`ownerId\` varchar(36) NULL,
                \`cultureCulturevalues\` json NULL,
                \`cultureEnvironmenttiles\` json NULL,
                \`cultureThrivepoints\` json NULL,
                \`benefitsBasesalarymin\` int NULL,
                \`benefitsBasesalarymax\` int NULL,
                \`benefitsCommissionmin\` int NULL,
                \`benefitsCommissionmax\` int NULL,
                \`benefitsTotalcompmin\` int NULL,
                \`benefitsTotalcompmax\` int NULL,
                \`benefitsSpecificbenefits\` json NULL,
                UNIQUE INDEX \`IDX_a7018eb2ac7b827608ba6856ca\` (\`companyName\`),
                UNIQUE INDEX \`REL_ee87438803acb531639e8284be\` (\`ownerId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(255) NOT NULL,
                \`email\` varchar(255) NULL,
                \`permission\` varchar(255) NULL,
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`location\` varchar(255) NULL,
                \`bio\` varchar(255) NULL,
                \`isVerified\` tinyint NULL,
                \`position\` varchar(255) NULL,
                \`type\` varchar(255) NOT NULL,
                \`companyId\` varchar(36) NULL,
                \`schoolId\` varchar(36) NULL,
                \`academicsMajor\` varchar(255) NULL,
                \`academicsMinor\` varchar(255) NULL,
                \`academicsGpa\` float NULL,
                \`academicsGraduationdate\` date NULL,
                \`academicsAwards\` varchar(255) NULL,
                \`academicsCoursework\` varchar(255) NULL,
                \`athleticsSport\` varchar(255) NULL,
                \`athleticsPosition\` varchar(255) NULL,
                \`athleticsDivision\` varchar(255) NULL,
                \`athleticsConference\` varchar(255) NULL,
                \`athleticsYearsplayed\` varchar(255) NULL,
                \`athleticsLeadershiproles\` varchar(255) NULL,
                \`athleticsAchievements\` varchar(255) NULL,
                \`athleticsStatistics\` varchar(255) NULL,
                \`athleticsSkills\` json NULL,
                UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`),
                INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` (\`type\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`job\` (
                \`id\` varchar(36) NOT NULL,
                \`position\` varchar(255) NULL,
                \`description\` varchar(255) NULL,
                \`industry\` varchar(255) NULL,
                \`experience\` varchar(255) NULL,
                \`createdDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`applicationDeadline\` date NULL,
                \`benefits\` varchar(255) NULL,
                \`type\` varchar(255) NULL,
                \`requirements\` varchar(255) NULL,
                \`location\` varchar(255) NULL,
                \`salary\` int NULL,
                \`tags\` text NULL,
                \`paymentType\` varchar(255) NULL,
                \`duration\` varchar(255) NULL,
                \`athleteBenefits\` varchar(255) NULL,
                \`status\` varchar(255) NULL,
                \`companyId\` varchar(36) NULL,
                \`ownerId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`school_domain\` (
                \`id\` varchar(36) NOT NULL,
                \`domain\` varchar(255) NOT NULL,
                \`schoolId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_8f16db58df871b99037f1bdfbc\` (\`domain\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`school\` (
                \`id\` varchar(36) NOT NULL,
                \`schoolName\` varchar(255) NULL,
                \`ownerId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` (\`schoolName\`),
                UNIQUE INDEX \`REL_cb3b185eba83efed664a5fdb04\` (\`ownerId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`interview\` (
                \`id\` varchar(36) NOT NULL,
                \`dateTime\` timestamp NOT NULL,
                \`location\` varchar(255) NULL,
                \`interviewer\` varchar(255) NULL,
                \`preparationTips\` varchar(255) NULL,
                \`status\` enum ('scheduled', 'cancelled', 'complete') NOT NULL DEFAULT 'scheduled',
                \`creationDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`jobId\` varchar(36) NOT NULL,
                \`applicationId\` varchar(36) NOT NULL,
                \`companyId\` varchar(36) NOT NULL,
                \`athleteId\` varchar(36) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`application\` (
                \`id\` varchar(36) NOT NULL,
                \`creationDate\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`terminalStatusDate\` date NULL,
                \`employerReviewed\` tinyint NOT NULL DEFAULT 0,
                \`status\` enum (
                    'applied',
                    'under_review',
                    'interview_requested',
                    'accepted',
                    'rejected',
                    'withdrawn'
                ) NOT NULL DEFAULT 'applied',
                \`jobId\` varchar(36) NOT NULL,
                \`athleteId\` varchar(36) NOT NULL,
                \`interviewId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`activity\` (
                \`activityId\` varchar(36) NOT NULL,
                \`type\` enum ('application', 'interview', 'other') NOT NULL DEFAULT 'other',
                \`message\` text NULL,
                \`date\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`userId\` varchar(36) NULL,
                \`applicationId\` varchar(36) NULL,
                \`interviewId\` varchar(36) NULL,
                PRIMARY KEY (\`activityId\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`email_whitelist\` (
                \`id\` varchar(36) NOT NULL,
                \`orgId\` varchar(255) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
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
            ALTER TABLE \`company\`
            ADD CONSTRAINT \`FK_ee87438803acb531639e8284be0\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_86586021a26d1180b0968f98502\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_709e51110daa2b560f0fc32367b\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD CONSTRAINT \`FK_e66170573cabd565dab1132727d\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD CONSTRAINT \`FK_4230d15401eafcf6f4538208015\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`school_domain\`
            ADD CONSTRAINT \`FK_01ea860d6c33a1717c9be3ba295\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`school\`
            ADD CONSTRAINT \`FK_cb3b185eba83efed664a5fdb04b\` FOREIGN KEY (\`ownerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\`
            ADD CONSTRAINT \`FK_15008468e129b5542f78d0718d6\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\`
            ADD CONSTRAINT \`FK_35c375805d4e8809adf67f635bb\` FOREIGN KEY (\`applicationId\`) REFERENCES \`application\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\`
            ADD CONSTRAINT \`FK_0b857d96710a97dd26045dd9e1c\` FOREIGN KEY (\`companyId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\`
            ADD CONSTRAINT \`FK_7b592980087d36455471496dcaf\` FOREIGN KEY (\`athleteId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD CONSTRAINT \`FK_dbc0341504212f830211b69ba0c\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD CONSTRAINT \`FK_0c6d7c3f1a826df20d718b9f3b1\` FOREIGN KEY (\`athleteId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD CONSTRAINT \`FK_7cca1f23def73793a5099e4f5a9\` FOREIGN KEY (\`interviewId\`) REFERENCES \`interview\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_c59262513a3006fd8f58bb4b7c2\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_96789153e31e0bb7885ea13a279\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_96789153e31e0bb7885ea13a279\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_c59262513a3006fd8f58bb4b7c2\`
        `);
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
            ALTER TABLE \`application\` DROP FOREIGN KEY \`FK_7cca1f23def73793a5099e4f5a9\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\` DROP FOREIGN KEY \`FK_0c6d7c3f1a826df20d718b9f3b1\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`application\` DROP FOREIGN KEY \`FK_dbc0341504212f830211b69ba0c\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\` DROP FOREIGN KEY \`FK_7b592980087d36455471496dcaf\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\` DROP FOREIGN KEY \`FK_0b857d96710a97dd26045dd9e1c\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\` DROP FOREIGN KEY \`FK_35c375805d4e8809adf67f635bb\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`interview\` DROP FOREIGN KEY \`FK_15008468e129b5542f78d0718d6\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`school\` DROP FOREIGN KEY \`FK_cb3b185eba83efed664a5fdb04b\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`school_domain\` DROP FOREIGN KEY \`FK_01ea860d6c33a1717c9be3ba295\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_4230d15401eafcf6f4538208015\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e66170573cabd565dab1132727d\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_709e51110daa2b560f0fc32367b\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_86586021a26d1180b0968f98502\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_ee87438803acb531639e8284be0\`
        `);
    await queryRunner.query(`
            DROP TABLE \`message\`
        `);
    await queryRunner.query(`
            DROP TABLE \`email_whitelist\`
        `);
    await queryRunner.query(`
            DROP TABLE \`activity\`
        `);
    await queryRunner.query(`
            DROP TABLE \`application\`
        `);
    await queryRunner.query(`
            DROP TABLE \`interview\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_cb3b185eba83efed664a5fdb04\` ON \`school\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` ON \`school\`
        `);
    await queryRunner.query(`
            DROP TABLE \`school\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_8f16db58df871b99037f1bdfbc\` ON \`school_domain\`
        `);
    await queryRunner.query(`
            DROP TABLE \`school_domain\`
        `);
    await queryRunner.query(`
            DROP TABLE \`job\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_31ef2b4d30675d0c15056b7f6e\` ON \`user\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
    await queryRunner.query(`
            DROP TABLE \`user\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_ee87438803acb531639e8284be\` ON \`company\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_a7018eb2ac7b827608ba6856ca\` ON \`company\`
        `);
    await queryRunner.query(`
            DROP TABLE \`company\`
        `);
  }
}
