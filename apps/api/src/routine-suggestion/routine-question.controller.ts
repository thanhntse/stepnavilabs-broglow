import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { RoutineQuestionService } from './routine-question.service';
import { CreateRoutineQuestionDto } from './dto/create-routine-question.dto';
import { UpdateRoutineQuestionDto } from './dto/update-routine-question.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PoliciesGuard } from '@api/casl/guards/policies.guard';
import { PaginationParams } from '@api/skin-profile/skin-profile.service';
import { CreateRoutineAnswersDto } from './dto/create-routine-answers.dto';
import { Response } from 'express';
import { Readable } from 'stream';

@ApiTags('routine-questions')
@Controller('routine-questions')
@UseGuards(AuthGuard(['api-key', 'jwt']), PoliciesGuard)
@ApiSecurity('API-Key-auth')
@ApiBearerAuth('JWT-auth')
export class RoutineQuestionController {
  constructor(
    private readonly routineQuestionService: RoutineQuestionService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new routine question' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  create(@Body() createRoutineQuestionDto: CreateRoutineQuestionDto) {
    return this.routineQuestionService.create(createRoutineQuestionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all routine questions with pagination' })
  @ApiResponse({ status: 200, description: 'Return paginated questions' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    description: 'Field to sort by (e.g. order, question)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    type: String,
    description: 'Sort order (asc or desc)',
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const paginationParams: PaginationParams = {
      page: page ? +page : undefined,
      limit: limit ? +limit : undefined,
      sortBy,
      sortOrder,
    };
    return this.routineQuestionService.findAll(paginationParams);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a routine question by ID' })
  @ApiResponse({ status: 200, description: 'Return the question' })
  findOne(@Param('id') id: string) {
    return this.routineQuestionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a routine question by ID' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateRoutineQuestionDto: UpdateRoutineQuestionDto,
  ) {
    return this.routineQuestionService.update(id, updateRoutineQuestionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a routine question by ID' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  remove(@Param('id') id: string) {
    return this.routineQuestionService.remove(id);
  }

  @Post('suggestions')
  async getSuggestions(
    @Body() answersDto: CreateRoutineAnswersDto,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { threadId, responseStream } =
      await this.routineQuestionService.getSuggestions(userId, answersDto);

    // Set response headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send thread ID first
    res.write(`data: ${JSON.stringify({ threadId })}\n\n`);

    // Pipe the response stream
    const nodeStream = Readable.from(responseStream as any);
    nodeStream.pipe(res);
  }
}
