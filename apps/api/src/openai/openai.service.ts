import {
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import OpenAI from 'openai';
import { AIUsage } from './schema/ai-usage.schema';
import { UserDocument } from '@api/users/schema/user.schema';
import { Thread } from './schema/thread.schema';
import { Message } from './schema/message.schema';
import { File } from '@api/files/schema/file.schema';
import {
  CustomBadRequestException,
  CustomNotFoundException
} from '@api/common/exceptions/custom-exceptions';
import { validateObjectId } from '@api/common/utils/mongoose.utils';
import { FilesService } from '@api/files/files.service';

@Injectable()
export class OpenAiService {
  private openai: OpenAI;
  private assistantId: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(AIUsage.name) private aiUsageModel: Model<AIUsage>,
    @InjectModel(Thread.name) private threadModel: Model<Thread>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(File.name) private fileModel: Model<File>,
    private filesService: FilesService,
  ) {
    this.openai = new OpenAI();
    this.assistantId = this.configService.get('OPENAI_ASSISTANT_ID') ?? '';
  }

  async retrieveFile(openaiFileId: string) {
    const [file, fileContent] = await Promise.all([
      this.openai.files.retrieve(openaiFileId),
      this.openai.files.content(openaiFileId),
    ]);
    return { file, fileContent };
  }

  async createAssistant() {
    const assistant = await this.openai.beta.assistants.create({
      instructions: 'You are a helpful assistant.',
      name: 'Quickstart Assistant',
      model: 'gpt-4o',
      tools: [
        { type: 'code_interpreter' },
        {
          type: 'function',
          function: {
            name: 'get_weather',
            description: 'Determine weather in my location',
            parameters: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'City and state e.g. San Francisco, CA',
                },
                unit: { type: 'string', enum: ['c', 'f'] },
              },
              required: ['location'],
            },
          },
        },
        { type: 'file_search' },
      ],
    });
    return { assistantId: assistant.id };
  }

  /* ================= THREAD START HERE ===================== */
  async createThread(ownerId: number, name?: string, description?: string) {
    const thread = await this.openai.beta.threads.create();
    const openaiThreadId = thread.id;

    const newThread = new this.threadModel({
      openaiThreadId,
      name,
      description,
      owner: ownerId,
    });

    return await newThread.save();
  }

  async listThreadsByUser(ownerId: number) {
    return await this.threadModel
      .find({ owner: ownerId })
      .sort({ createdAt: -1 });
  }

  async retrieveThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(`Thread with ID ${threadId} not found`, 'threadNotFound');
    }
    return await this.openai.beta.threads.retrieve(thread.openaiThreadId);
  }

  async deleteThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(`Thread with ID ${threadId} not found`, 'threadNotFound');
    }

    try {
      await this.openai.beta.threads.del(thread.openaiThreadId);
    } catch (error) {
      console.error('Failed to delete thread on OpenAI:', error);
      throw new CustomBadRequestException('Could not delete thread on OpenAI', 'threadDeletionFailed');
    }

    await this.threadModel.deleteOne({ _id: threadId });

    return { message: `Thread ${threadId} deleted successfully` };
  }
  /* ================= THREAD END HERE ===================== */

  /* ================= MESSAGE START HERE ===================== */
  async sendMessageToThread(
    threadId: string,
    content: any,
  ) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(`Thread with ID ${threadId} not found`, 'threadNotFound');
    }

    try {
      const userMessage = await this.openai.beta.threads.messages.create(
        thread.openaiThreadId,
        { role: 'user', content: content },
      );

      const userMsgEntity = new this.messageModel({
        openaiMessageId: userMessage.id,
        content:
          typeof content === 'string' ? content : JSON.stringify(content),
        thread: threadId,
        sender: 'user',
        metadata: {
          contentType: typeof content === 'object' ? 'json' : 'text',
          timestamp: new Date().toISOString(),
        },
      });

      const savedUserMsg = await userMsgEntity.save();

      // Xử lý files nếu có trong content
      const fileIds = [];

      // Kiểm tra nếu content là mảng (format OpenAI)
      if (Array.isArray(content)) {
        // Lọc các phần tử có type là image_file
        const imageFileItems = content.filter(
          item => item.type === 'image_file' && item.image_file?.file_id
        );

        // Lấy file_id từ mỗi image_file
        for (const item of imageFileItems) {
          if (item.image_file?.file_id) {
            fileIds.push(item.image_file.file_id);
          }
        }
      }

      // Xử lý files tìm thấy trong content
      if (fileIds.length > 0) {
        // Kiểm tra từng file trong fileIds
        for (const openaiFileId of fileIds) {
          // Tìm file có openaiFileId trong hệ thống
          const existingFile = await this.fileModel.findOne({ openaiFileId });

          if (existingFile) {
            // Nếu file đã tồn tại, cập nhật message ID
            await this.filesService.updateFileWithMessage(
              existingFile._id as unknown as string,
              savedUserMsg._id as unknown as string
            );
          } else {
            // Nếu không tìm thấy file, tạo mới record chỉ với openaiFileId và message
            const newFile = new this.fileModel({
              openaiFileId,
              message: savedUserMsg._id,
            });
            await newFile.save();
          }
        }
      }

      const stream = await this.openai.beta.threads.runs.stream(
        thread.openaiThreadId,
        { assistant_id: this.assistantId },
      );

      let assistantMessageId = '';
      let assistantContent = '';

      stream.on('messageDone', (message: any) => {
        assistantMessageId = message.id;
      });

      stream.on('textDelta', (delta: any) => {
        const text = delta?.value || delta?.text || '';
        assistantContent += text;
      });

      stream.on('end', async () => {
        try {
          const assistantMsg = new this.messageModel({
            openaiMessageId: assistantMessageId || `assistant-${Date.now()}`,
            content: assistantContent,
            thread: threadId,
            sender: 'assistant',
            metadata: {
              contentType: 'text',
              timestamp: new Date().toISOString(),
              complete: !!assistantMessageId,
            },
          });

          await assistantMsg.save();

          // Auto-generate thread name if needed
          if (!thread.name) {
            // Non-blocking operation to generate thread name
            this.generateThreadName(threadId, content, assistantContent).catch(error => {
              console.error('Thread naming error:', error);
            });
          }
        } catch (error) {
          console.error('Failed to save assistant message:', error);
        }
      });

      return stream.toReadableStream();
    } catch (error) {
      console.error('Error in sendMessageToThread:', error);
      throw new CustomBadRequestException(
        error.message || 'Failed to send message to thread',
        'sendMessageFailed'
      );
    }
  }

  async listMessagesByThread(threadId: string) {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);
    if (!thread) {
      throw new CustomNotFoundException(`Thread with ID ${threadId} not found`, 'threadNotFound');
    }

    const messages = await this.messageModel
      .find({ thread: threadId })
      .sort({ createdAt: 1 });

    const formattedMessages = [];

    for (const message of messages) {
      const files = await this.fileModel.find({ message: message._id });

      let messageContent;
      try {
        if (message.metadata?.contentType === 'json') {
          messageContent = JSON.parse(message.content);
        } else {
          messageContent = [
            {
              type: 'text',
              text: { value: message.content },
            },
          ];
        }
      } catch (e) {
        console.error('Error in listMessagesByThread:', e);

        messageContent = [
          {
            type: 'text',
            text: { value: message.content },
          },
        ];
      }

      if (files.length > 0) {
        const fileObjects = files.map((file) => ({
          type: 'image_file',
          image_file: {
            file_id: file.openaiFileId,
          },
        }));

        if (Array.isArray(messageContent)) {
          messageContent = [...messageContent, ...fileObjects];
        } else {
          messageContent = [
            { type: 'text', text: { value: message.content } },
            ...fileObjects,
          ];
        }
      }

      formattedMessages.push({
        id: message._id,
        role: message.sender,
        content: messageContent,
        created_at: message.createdAt,
        thread_id: threadId,
        openai_id: message.openaiMessageId,
        metadata: message.metadata || {},
      });
    }

    return {
      data: formattedMessages,
      total: formattedMessages.length,
    };
  }
  /* ================= MESSAGE END HERE ===================== */

  async submitToolOutputs(
    threadId: string,
    runId: string,
    toolCallOutputs: any,
  ) {
    const stream = this.openai.beta.threads.runs.submitToolOutputsStream(
      threadId,
      runId,
      { tool_outputs: toolCallOutputs },
    );

    return stream.toReadableStream();
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(file.path);

      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.mimetype });

      formData.append('file', blob, file.originalname);
      formData.append('purpose', 'vision');

      const response = await fetch('https://api.openai.com/v1/files', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.configService.get('OPENAI_API_KEY') ?? ''}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.id) {
        throw new CustomBadRequestException('Upload file to OpenAI failed', 'openaiUploadFailed');
      }

      return { openaiFileId: data.id };
    } catch (error) {
      console.error('File upload error:', error);
      throw new CustomBadRequestException(
        error.message || 'Upload file failed',
        'fileUploadFailed'
      );
    }
  }

  async getUsage(user: UserDocument): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() - 7);

    const usage = await this.aiUsageModel.findOne({
      user: user._id.toString(),
      createdAt: { $gte: today },
    });

    return usage ? usage.promptCount : 0;
  }

  async incrementUsage(user: UserDocument, limit: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setHours(today.getHours() - 7);

    const userId = user._id.toString();

    let usage = await this.aiUsageModel.findOne({
      user: userId,
      createdAt: { $gte: today },
    });

    if (!usage) {
      usage = new this.aiUsageModel({ user: userId, promptCount: 0 });
    }

    if (usage.promptCount >= limit) return false;

    usage.promptCount += 1;
    await usage.save();
    return true;
  }

  async resetDailyUsage(): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.aiUsageModel.deleteMany({ createdAt: { $lt: today } });
  }

  /**
   * Generate and set a thread name based on conversation content
   * @param threadId - The thread ID
   * @param userContent - The user message content
   * @param assistantContent - The assistant response content
   */
  private async generateThreadName(
    threadId: string,
    userContent: any,
    assistantContent: string
  ): Promise<void> {
    try {
      // Truncate content for the API request (to avoid token limits)
      const userContentStr = typeof userContent === 'string'
        ? userContent.substring(0, 500)
        : JSON.stringify(userContent).substring(0, 500);

      const assistantContentStr = assistantContent.substring(0, 500);

      const summaryPrompt = `Bạn là một AI giúp tóm tắt đoạn hội thoại dưới đây thành một tiêu đề ngắn gọn (tối đa 40 ký tự).
Tiêu đề phải ngắn gọn, súc tích, phản ánh nội dung chính của cuộc trò chuyện.
Không sử dụng dấu ngoặc kép.

Đoạn hội thoại:
Người dùng: ${userContentStr}
Trợ lý: ${assistantContentStr}

Tiêu đề:`;

      const titleResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: 'Bạn là một AI giúp tạo tiêu đề ngắn gọn.' },
        { role: 'user', content: summaryPrompt }],
        max_tokens: 40,
        temperature: 0.7,
      });

      const generatedTitle = titleResponse.choices[0]?.message?.content?.trim();

      if (generatedTitle) {
        // Update thread with the generated name
        const updatedThread = await this.threadModel.findByIdAndUpdate(
          threadId,
          { name: generatedTitle },
          { new: true }
        );

        if (!updatedThread) {
          console.warn(`Could not update thread ${threadId} with generated title`);
        }
      }
    } catch (error) {
      console.error('Error generating thread title:', error);
      // Error is caught and logged but not re-thrown to prevent blocking the main response flow
    }
  }

  /**
   * Check if a user is the owner of a thread
   * @param threadId Thread ID to check
   * @param userId User ID to check ownership for
   * @returns boolean indicating if the user is the owner
   */
  async isThreadOwner(threadId: string, userId: string): Promise<boolean> {
    validateObjectId(threadId, 'thread');
    const thread = await this.threadModel.findById(threadId);

    if (!thread) {
      throw new CustomNotFoundException(`Thread with ID ${threadId} not found`, 'threadNotFound');
    }

    // Convert to string for comparison if needed
    const ownerId = thread.owner.toString();
    const userIdStr = userId.toString();

    return ownerId === userIdStr;
  }
}
