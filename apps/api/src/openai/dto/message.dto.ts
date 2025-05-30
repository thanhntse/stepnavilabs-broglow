import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsEnum } from 'class-validator';
import { ConversationTone } from '../enums/tone.enum';

export class MessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how can you help me today?',
  })
  content: any;

  @ApiProperty({
    description: 'Conversation tone/style',
    enum: ConversationTone,
    example: ConversationTone.PROFESSIONAL,
    required: false,
  })
  @IsEnum(ConversationTone)
  @IsOptional()
  tone?: ConversationTone;
}
