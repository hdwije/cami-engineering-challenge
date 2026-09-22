import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from './customer-request.entity';
import { ClassifyDto } from './dtos';
import { Classification } from './classification.entity';
import {
  CLASSIFICATION_PROVIDER,
  ClassificationCategory,
  ClassificationProvider,
} from './classification-provider.interface';

export type RequestListItem = {
  id: string;
  message: string;
  status: RequestStatus;
  category: string | null;
  confidence: number | null;
  noteCount: number;
  latestNotePreview: string | null;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(CustomerRequest)
    private readonly requests: Repository<CustomerRequest>,
    @InjectRepository(Classification)
    private readonly classifications: Repository<Classification>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(CLASSIFICATION_PROVIDER)
    private readonly classifier: ClassificationProvider,
  ) {}

  async list(): Promise<RequestListItem[]> {
    const { entities, raw } = await this.requests
      .createQueryBuilder('request')
      .leftJoin('request.notes', 'note')
      .addSelect('COUNT(note.id)', 'noteCount')
      .addSelect(
        `(SELECT n.body FROM request_notes n
      WHERE n.request_id = request.id
      ORDER BY n.created_at DESC LIMIT 1)`,
        'latestNotePreview',
      )
      .groupBy('request.id')
      .orderBy('request.createdAt', 'DESC')
      .getRawAndEntities();

    return entities.map((row, i) => ({
      id: row.id,
      message: row.message,
      status: row.status,
      category: row.category,
      confidence: row.confidence,
      noteCount: Number(raw[i].noteCount),
      latestNotePreview: raw[i].latestNotePreview ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  async getById(id: string): Promise<CustomerRequest> {
    const row = await this.requests.findOne({
      where: { id },
      relations: { notes: true },
    });
    if (!row) {
      throw new NotFoundException(`Request ${id} not found`);
    }
    return row;
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
  ): Promise<CustomerRequest> {
    const row = await this.getById(id);
    row.status = status;
    return this.requests.save(row);
  }

  async create(message: string): Promise<CustomerRequest> {
    const row = this.requests.create({
      message,
      status: 'open',
      category: null,
      confidence: null,
    });
    return this.requests.save(row);
  }

  async save(request: CustomerRequest): Promise<CustomerRequest> {
    return this.requests.save(request);
  }

  async classify({ message, requestId }: ClassifyDto): Promise<{
    category: ClassificationCategory;
    confidence: number;
    requestId: string | null;
  }> {
    const trimmed = message.trim();
    let result = this.classifier.classify(trimmed);

    // Soften confidence for very short messages.
    if (trimmed.split(/\s+/).length < 3 && result.category !== 'unknown') {
      result = {
        category: result.category,
        confidence: Math.max(0.5, result.confidence - 0.15),
      };
    }

    // Prefer "unknown" when confidence is weak.
    if (result.confidence < 0.55) {
      result = { category: 'unknown', confidence: result.confidence };
    }

    if (requestId) {
      await this.dataSource.transaction(async (entityManager) => {
        const existing = await entityManager.findOneBy(CustomerRequest, {
          id: requestId,
        });

        if (!existing) throw new NotFoundException('Request is not found!');

        existing.category = result.category;
        existing.confidence = result.confidence;

        if (existing.status === 'open') {
          existing.status = 'in_progress';
        }

        await entityManager.save(existing);
        await entityManager.insert(Classification, {
          request: existing,
          category: result.category,
          confidence: result.confidence,
          provider: this.classifier.name,
        });
      });
    }

    return {
      category: result.category,
      confidence: result.confidence,
      requestId: requestId ?? null,
    };
  }

  async getClassifications(category?: string) {
    const query = this.classifications
      .createQueryBuilder('c')
      .leftJoin('c.request', 'r')
      .addSelect(['r.id', 'r.message'])
      .where(category ? 'c.category LIKE %:category%' : '1=1', { category })
      .orderBy('c.createdAt', 'DESC')
      .take(100);

    if (category) {
      query.where('c.category ILIKE :category', { category: `%${category}%` });
    }

    const list = await query.getMany();

    return list;
  }
}
