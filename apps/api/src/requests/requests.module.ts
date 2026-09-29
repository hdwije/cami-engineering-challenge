import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerRequest } from './customer-request.entity';
import { RequestNote } from './request-note.entity';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { KeywordClassifier } from './keyword-classifier';
import { CLASSIFICATION_PROVIDER } from './classification-provider.interface';
import { Classification } from './classification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CustomerRequest, RequestNote, Classification]),
  ],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    KeywordClassifier,
    { provide: CLASSIFICATION_PROVIDER, useClass: KeywordClassifier },
  ],
})
export class RequestsModule {}
