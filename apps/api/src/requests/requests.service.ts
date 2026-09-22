import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerRequest, RequestStatus } from './customer-request.entity';
import { RequestNote } from './request-note.entity';

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
    @InjectRepository(RequestNote)
    private readonly notes: Repository<RequestNote>,
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
}
