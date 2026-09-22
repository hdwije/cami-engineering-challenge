import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ClassifyDto } from '../src/requests/dtos';
import { RequestsController } from '../src/requests/requests.controller';
import { RequestsService } from '../src/requests/requests.service';
import { KeywordClassifier } from '../src/requests/keyword-classifier';
import { DataSource, Repository } from 'typeorm';
import { CustomerRequest } from '../src/requests/customer-request.entity';
import { Classification } from '../src/requests/classification.entity';

function messagesFor(errors: Awaited<ReturnType<typeof validate>>): string[] {
  return errors.flatMap((error) => Object.values(error.constraints ?? {}));
}

describe('ClassifyDto validation', () => {
  it('rejects an empty message', async () => {
    const dto = plainToInstance(ClassifyDto, { message: '' });
    const errors = await validate(dto);

    expect(messagesFor(errors)).toContain('message must be a non-empty string');
  });

  it('rejects a message that is too long', async () => {
    const dto = plainToInstance(ClassifyDto, { message: 'a'.repeat(2001) });
    const errors = await validate(dto);

    expect(messagesFor(errors)).toContain('message too long');
  });
});

describe('RequestsService.classify / RequestsController.classify', () => {
  const classifier = new KeywordClassifier();
  const service = new RequestsService(
    {} as Repository<CustomerRequest>,
    {} as Repository<Classification>,
    {} as DataSource,
    classifier,
  );
  const controller = new RequestsController(service);

  it('softens confidence for very short messages (service and controller agree)', async () => {
    const dto = { message: 'urgent bug' } as ClassifyDto;

    const serviceResult = await service.classify(dto);
    const controllerResult = await controller.classify(dto);

    expect(controllerResult).toEqual(serviceResult);
    expect(serviceResult.category).toBe('support');
    expect(serviceResult.confidence).toBeCloseTo(0.63, 5);
    expect(serviceResult.requestId).toBe(null);
  });

  it('prefers "unknown" when confidence is weak (service and controller agree)', async () => {
    const stubClassifier = {
      classify: () => ({ category: 'support', confidence: 0.5 }),
    } as any;
    const weakService = new RequestsService(
      {} as Repository<CustomerRequest>,
      {} as Repository<Classification>,
      {} as DataSource,
      stubClassifier,
    );
    const weakController = new RequestsController(weakService);
    const dto = { message: 'just letting you know' } as ClassifyDto;

    const serviceResult = await weakService.classify(dto);
    const controllerResult = await weakController.classify(dto);

    expect(controllerResult).toEqual(serviceResult);
    expect(serviceResult.category).toBe('unknown');
    expect(serviceResult.confidence).toBeCloseTo(0.5, 5);
    expect(serviceResult.requestId).toBe(null);
  });
});
