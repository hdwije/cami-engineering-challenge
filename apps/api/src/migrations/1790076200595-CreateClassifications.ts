import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateClassifications1790076200595 implements MigrationInterface {
  name = 'CreateClassifications1790076200595';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS classifications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        category varchar(32) NULL,
        confidence double precision NULL,
        provider varchar NULL,
        request_id uuid NOT NULL REFERENCES customer_requests(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_classifications_category
      ON classifications(category);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS classifications;`);
  }
}
