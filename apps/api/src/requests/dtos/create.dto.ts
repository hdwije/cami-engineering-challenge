import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDto {
  @IsNotEmpty({ message: 'message is required' })
  @IsString({ message: 'message is required' })
  message!: string;
}
