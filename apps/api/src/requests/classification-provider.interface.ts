export type ClassificationCategory =
  | 'support'
  | 'sales'
  | 'billing'
  | 'unknown';

export type ClassificationResult = {
  category: ClassificationCategory;
  confidence: number;
};

export const CLASSIFICATION_PROVIDER = 'CLASSIFICATION_PROVIDER';

export interface ClassificationProvider {
  readonly name: string;

  classify(message: string): ClassificationResult;
}
