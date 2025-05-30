import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiController } from './openai.controller';
import { OpenAiService } from './openai.service';
import { Thread, ThreadSchema } from './schema/thread.schema';
import { Message, MessageSchema } from './schema/message.schema';
import { AIUsage, AIUsageSchema } from './schema/ai-usage.schema';
import { UsersModule } from '@api/users/users.module';
import { File, FileSchema } from '@api/files/schema/file.schema';
import { ApiKeyModule } from '@api/api-keys/api-key.module';
import { CaslModule } from '@api/casl/casl.module';
import { FilesService } from '@api/files/files.service';
import { FilesModule } from '@api/files/files.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Thread.name, schema: ThreadSchema },
      { name: Message.name, schema: MessageSchema },
      { name: AIUsage.name, schema: AIUsageSchema },
      { name: File.name, schema: FileSchema },
    ]),
    UsersModule,
    ApiKeyModule,
    CaslModule,
    FilesModule,
  ],
  controllers: [OpenAiController],
  providers: [OpenAiService, FilesService],
})
export class OpenAiModule {}
