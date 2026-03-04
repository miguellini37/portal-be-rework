import { MigrationInterface, QueryRunner } from 'typeorm';
import universities from '../data/us_universities.json';

export class SeedUsUniversities1772303000000 implements MigrationInterface {
  name = 'SeedUsUniversities1772303000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const schoolBatchSize = 50;

    // Insert schools in batches
    for (let i = 0; i < universities.length; i += schoolBatchSize) {
      const batch = universities.slice(i, i + schoolBatchSize);
      const placeholders = batch.map(() => '(UUID(), ?)').join(', ');
      const params = batch.map((s) => s.schoolName);
      await queryRunner.query(
        `INSERT IGNORE INTO \`school\` (\`id\`, \`schoolName\`) VALUES ${placeholders}`,
        params
      );
    }

    // Insert domains — look up school IDs by name
    const domainBatchSize = 50;
    const domainEntries: { schoolName: string; domain: string }[] = [];

    for (const uni of universities) {
      for (const domain of uni.domains) {
        domainEntries.push({ schoolName: uni.schoolName, domain });
      }
    }

    for (let i = 0; i < domainEntries.length; i += domainBatchSize) {
      const batch = domainEntries.slice(i, i + domainBatchSize);
      const placeholders = batch
        .map(() => '(UUID(), ?, (SELECT id FROM school WHERE schoolName = ?))')
        .join(', ');
      const params = batch.flatMap((entry) => [entry.domain, entry.schoolName]);
      await queryRunner.query(
        `INSERT IGNORE INTO \`school_domain\` (\`id\`, \`domain\`, \`schoolId\`) VALUES ${placeholders}`,
        params
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schoolNames = universities.map((s) => s.schoolName);
    if (schoolNames.length > 0) {
      const placeholders = schoolNames.map(() => '?').join(', ');

      // Delete domains first (foreign key constraint)
      await queryRunner.query(
        `DELETE FROM \`school_domain\` WHERE \`schoolId\` IN (SELECT \`id\` FROM \`school\` WHERE \`schoolName\` IN (${placeholders}))`,
        schoolNames
      );

      // Delete schools
      await queryRunner.query(
        `DELETE FROM \`school\` WHERE \`schoolName\` IN (${placeholders})`,
        schoolNames
      );
    }
  }
}
