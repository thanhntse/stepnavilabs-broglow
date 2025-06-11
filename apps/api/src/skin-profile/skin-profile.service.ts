import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SkinQuestion } from './schema/skin-question.schema';
import { SkinProfile } from './schema/skin-profile.schema';
import { CreateSkinQuestionDto } from './dto/create-skin-question.dto';
import { UpdateSkinQuestionDto } from './dto/update-skin-question.dto';
import { SubmitSkinProfileDto } from './dto/submit-skin-profile.dto';

@Injectable()
export class SkinProfileService {
  constructor(
    @InjectModel(SkinQuestion.name)
    private skinQuestionModel: Model<SkinQuestion>,
    @InjectModel(SkinProfile.name) private skinProfileModel: Model<SkinProfile>,
  ) {}

  // Skin Question Methods
  async createQuestion(
    createSkinQuestionDto: CreateSkinQuestionDto,
  ): Promise<SkinQuestion> {
    const createdQuestion = new this.skinQuestionModel(createSkinQuestionDto);
    return createdQuestion.save();
  }

  async findAllQuestions() {
    return this.skinQuestionModel
      .find({ isActive: true })
      .sort({ order: 1 })
      .exec();
  }

  async findQuestionById(id: string): Promise<SkinQuestion> {
    const question = await this.skinQuestionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Skin question with ID ${id} not found`);
    }
    return question;
  }

  async updateQuestion(
    id: string,
    updateSkinQuestionDto: UpdateSkinQuestionDto,
  ): Promise<SkinQuestion> {
    const updatedQuestion = await this.skinQuestionModel
      .findByIdAndUpdate(id, updateSkinQuestionDto, { new: true })
      .exec();

    if (!updatedQuestion) {
      throw new NotFoundException(`Skin question with ID ${id} not found`);
    }
    return updatedQuestion;
  }

  async removeQuestion(id: string): Promise<SkinQuestion> {
    const deletedQuestion = await this.skinQuestionModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedQuestion) {
      throw new NotFoundException(`Skin question with ID ${id} not found`);
    }
    return deletedQuestion;
  }

  // Skin Profile Methods
  async submitSkinProfile(
    userId: string,
    submitDto: SubmitSkinProfileDto,
  ): Promise<SkinProfile> {
    // Validate that all questions exist
    const questionIds = submitDto.answers.map((answer) => answer.questionId);
    const foundQuestions = await this.skinQuestionModel
      .find({ _id: { $in: questionIds } })
      .exec();

    if (foundQuestions.length !== questionIds.length) {
      throw new BadRequestException('One or more question IDs are invalid');
    }

    // Check for required questions
    const requiredQuestions = await this.skinQuestionModel
      .find({ isRequired: true, isActive: true })
      .exec();

    const requiredIds = requiredQuestions.map((q) => q._id.toString());
    const answeredIds = submitDto.answers.map((a) => a.questionId);

    const missingRequiredIds = requiredIds.filter(
      (id) => !answeredIds.includes(id),
    );
    if (missingRequiredIds.length > 0) {
      throw new BadRequestException(
        `Missing answers for required questions: ${missingRequiredIds.join(', ')}`,
      );
    }

    // Find existing profile or create new one
    let skinProfile = await this.skinProfileModel.findOne({ userId }).exec();

    // Convert DTO answers to schema format
    const formattedAnswers = submitDto.answers.map((ans) => ({
      questionId: new Types.ObjectId(ans.questionId),
      answer: ans.answer,
    }));

    if (!skinProfile) {
      skinProfile = new this.skinProfileModel({
        userId,
        answers: formattedAnswers,
      });
    } else {
      skinProfile.answers = formattedAnswers;
    }

    // Save profile
    return skinProfile.save();
  }

  async getUserSkinProfile(userId: string): Promise<SkinProfile> {
    const profile = await this.skinProfileModel
      .findOne({ userId })
      .populate({
        path: 'answers.questionId',
        model: 'SkinQuestion',
      })
      .exec();

    if (!profile) {
      throw new NotFoundException(`Skin profile for user ${userId} not found`);
    }

    return profile;
  }

  async deleteUserSkinProfile(userId: string): Promise<SkinProfile> {
    const deletedProfile = await this.skinProfileModel
      .findOneAndDelete({ userId })
      .exec();

    if (!deletedProfile) {
      throw new NotFoundException(`Skin profile for user ${userId} not found`);
    }

    return deletedProfile;
  }
}
