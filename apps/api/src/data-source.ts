import { DataSource } from 'typeorm';
import { CustomerRequest } from './requests/customer-request.entity';
import { RequestNote } from './requests/request-note.entity';
import { Classification } from './requests/classification.entity';
import { InitialSchema1710000000000 } from './migrations/1710000000000-InitialSchema';
import { CreateClassifications1790076200595 } from './migrations/1790076200595-CreateClassifications';

export function createDataSource() {
  return new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL ?? 'postgres://cami:cami@localhost:5432/cami',
    entities: [CustomerRequest, RequestNote, Classification],
    migrations: [InitialSchema1710000000000, CreateClassifications1790076200595],
    synchronize: false,
    logging: false,
  });
}
