import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757508907599 implements MigrationInterface {
  name = 'Migration1757508907599';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NULL,
                \`password\` varchar(255) NULL,
                \`permission\` varchar(255) NULL DEFAULT 'user',
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`phone\` varchar(255) NULL,
                \`location\` varchar(255) NULL,
                \`bio\` varchar(255) NULL,
                \`position\` varchar(255) NULL,
                \`type\` varchar(255) NOT NULL,
                \`companyRefId\` varchar(36) NULL,
                \`schoolRefId\` varchar(36) NULL,
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
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`company\` (
                \`id\` varchar(36) NOT NULL,
                \`companyName\` varchar(255) NULL,
                \`industry\` varchar(255) NULL,
                \`recruiting\` json NULL,
                \`ownerRefId\` varchar(36) NULL,
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
                UNIQUE INDEX \`REL_859dc203a23d97e7a8a7c1c7c4\` (\`ownerRefId\`),
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
                \`createdDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
            CREATE TABLE \`school\` (
                \`id\` varchar(36) NOT NULL,
                \`schoolName\` varchar(255) NULL,
                \`ownerRefId\` varchar(36) NULL,
                UNIQUE INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` (\`schoolName\`),
                UNIQUE INDEX \`REL_21fa1878f7ae3fd4d8d4029772\` (\`ownerRefId\`),
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
                \`creationDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
                \`creationDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
            CREATE TABLE \`post\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` varchar(255) NULL,
                \`date\` date NULL,
                \`type\` varchar(255) NULL,
                \`authorId\` varchar(36) NULL,
                \`schoolId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`comment\` (
                \`id\` varchar(36) NOT NULL,
                \`content\` varchar(255) NULL,
                \`postId\` varchar(36) NULL,
                \`authorId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`job_note\` (
                \`id\` varchar(36) NOT NULL,
                \`note\` text NOT NULL,
                \`jobId\` varchar(36) NOT NULL,
                \`athleteId\` varchar(36) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`message\` (
                \`id\` varchar(36) NOT NULL,
                \`message\` varchar(255) NULL,
                \`createdDate\` timestamp NULL,
                \`fromUserId\` varchar(36) NULL,
                \`toUserId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`school_event\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NULL,
                \`type\` varchar(255) NULL,
                \`description\` varchar(255) NULL,
                \`date\` date NULL,
                \`location\` varchar(255) NULL,
                \`schoolId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_981cc89a6e49d019d81b4a98f6f\` FOREIGN KEY (\`companyRefId\`) REFERENCES \`company\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD CONSTRAINT \`FK_02119985094dfe844ef334aacc8\` FOREIGN KEY (\`schoolRefId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\`
            ADD CONSTRAINT \`FK_859dc203a23d97e7a8a7c1c7c44\` FOREIGN KEY (\`ownerRefId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`school\`
            ADD CONSTRAINT \`FK_21fa1878f7ae3fd4d8d40297720\` FOREIGN KEY (\`ownerRefId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`post\`
            ADD CONSTRAINT \`FK_c6fb082a3114f35d0cc27c518e0\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`post\`
            ADD CONSTRAINT \`FK_2a39546ac8af066d45aa251c863\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_94a85bb16d24033a2afdd5df060\` FOREIGN KEY (\`postId\`) REFERENCES \`post\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`comment\`
            ADD CONSTRAINT \`FK_276779da446413a0d79598d4fbd\` FOREIGN KEY (\`authorId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`job_note\`
            ADD CONSTRAINT \`FK_c247d6d54ff88ad2e25ba570565\` FOREIGN KEY (\`jobId\`) REFERENCES \`job\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`job_note\`
            ADD CONSTRAINT \`FK_254f4933205abca8f6a362559fd\` FOREIGN KEY (\`athleteId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_c59262513a3006fd8f58bb4b7c2\` FOREIGN KEY (\`fromUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\`
            ADD CONSTRAINT \`FK_96789153e31e0bb7885ea13a279\` FOREIGN KEY (\`toUserId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`school_event\`
            ADD CONSTRAINT \`FK_769fd7a0f041de4be5bde29c300\` FOREIGN KEY (\`schoolId\`) REFERENCES \`school\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`school_event\` DROP FOREIGN KEY \`FK_769fd7a0f041de4be5bde29c300\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_96789153e31e0bb7885ea13a279\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`message\` DROP FOREIGN KEY \`FK_c59262513a3006fd8f58bb4b7c2\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job_note\` DROP FOREIGN KEY \`FK_254f4933205abca8f6a362559fd\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job_note\` DROP FOREIGN KEY \`FK_c247d6d54ff88ad2e25ba570565\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_276779da446413a0d79598d4fbd\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`comment\` DROP FOREIGN KEY \`FK_94a85bb16d24033a2afdd5df060\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_2a39546ac8af066d45aa251c863\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`post\` DROP FOREIGN KEY \`FK_c6fb082a3114f35d0cc27c518e0\`
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
            ALTER TABLE \`school\` DROP FOREIGN KEY \`FK_21fa1878f7ae3fd4d8d40297720\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_4230d15401eafcf6f4538208015\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_e66170573cabd565dab1132727d\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company\` DROP FOREIGN KEY \`FK_859dc203a23d97e7a8a7c1c7c44\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_02119985094dfe844ef334aacc8\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_981cc89a6e49d019d81b4a98f6f\`
        `);
    await queryRunner.query(`
            DROP TABLE \`school_event\`
        `);
    await queryRunner.query(`
            DROP TABLE \`message\`
        `);
    await queryRunner.query(`
            DROP TABLE \`job_note\`
        `);
    await queryRunner.query(`
            DROP TABLE \`comment\`
        `);
    await queryRunner.query(`
            DROP TABLE \`post\`
        `);
    await queryRunner.query(`
            DROP TABLE \`application\`
        `);
    await queryRunner.query(`
            DROP TABLE \`interview\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_21fa1878f7ae3fd4d8d4029772\` ON \`school\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_9eb00e0accde5ee2d96e86570b\` ON \`school\`
        `);
    await queryRunner.query(`
            DROP TABLE \`school\`
        `);
    await queryRunner.query(`
            DROP TABLE \`job\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_859dc203a23d97e7a8a7c1c7c4\` ON \`company\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_a7018eb2ac7b827608ba6856ca\` ON \`company\`
        `);
    await queryRunner.query(`
            DROP TABLE \`company\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\`
        `);
    await queryRunner.query(`
            DROP TABLE \`user\`
        `);
  }
}
