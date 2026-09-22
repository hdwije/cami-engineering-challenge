import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { ClassifyDto, CreateDto, UpdateDto } from './dtos';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get()
  list() {
    return this.requestsService.list();
  }

  @Get('history')
  history(@Query('category') category?: string) {
    return this.requestsService.getClassifications(category);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.requestsService.getById(id);
  }

  @Post()
  create(@Body() body: CreateDto) {
    return this.requestsService.create(body.message);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateDto) {
    return this.requestsService.updateStatus(id, body.status);
  }

  @Post('classify')
  async classify(@Body() body: ClassifyDto) {
    return this.requestsService.classify(body);
  }
}
