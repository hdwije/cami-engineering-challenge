import { Injectable } from '@nestjs/common';
import {
  ClassificationProvider,
  ClassificationResult,
} from './classification-provider.interface';

@Injectable()
export class LlmClassifier implements ClassificationProvider {
  readonly name = 'keyword';

  classify(message: string): ClassificationResult {
    return { category: 'unknown', confidence: 0.0 };
  }
}
