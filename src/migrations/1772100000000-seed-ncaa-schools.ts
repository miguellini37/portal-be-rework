import { MigrationInterface, QueryRunner } from 'typeorm';
import ncaaSchools from '../data/ncaa_schools.json';

export class SeedNcaaSchools1772100000000 implements MigrationInterface {
  name = 'SeedNcaaSchools1772100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const batchSize = 50;
    for (let i = 0; i < ncaaSchools.length; i += batchSize) {
      const batch = ncaaSchools.slice(i, i + batchSize);
      const placeholders = batch.map(() => '(UUID(), ?)').join(', ');
      const params = batch.map((s) => s.schoolName);
      await queryRunner.query(
        `INSERT IGNORE INTO \`school\` (\`id\`, \`schoolName\`) VALUES ${placeholders}`,
        params
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schoolNames = ncaaSchools.map((s) => s.schoolName);
    if (schoolNames.length > 0) {
      const placeholders = schoolNames.map(() => '?').join(', ');
      await queryRunner.query(
        `DELETE FROM \`school\` WHERE \`schoolName\` IN (${placeholders})`,
        schoolNames
      );
    }
  }
}
