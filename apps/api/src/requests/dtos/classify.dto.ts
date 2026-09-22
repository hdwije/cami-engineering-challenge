import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class ClassifyDto {
  @IsNotEmpty({ message: 'message must be a non-empty string' })
  @IsString({ message: 'message must be a non-empty string' })
  @MaxLength(2000, { message: 'message too long' })
  message!: string;

  @IsOptional()
  requestId?: string;
}
