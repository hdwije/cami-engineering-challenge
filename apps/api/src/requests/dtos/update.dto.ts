import { IsNotEmpty } from 'class-validator';
import { RequestStatus } from '../customer-request.entity';

export class UpdateDto {
  @IsNotEmpty({ message: 'status is required' })
  status!: RequestStatus;
}
