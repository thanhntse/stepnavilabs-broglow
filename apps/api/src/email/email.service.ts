import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SESClient,
  SendEmailCommand,
  SendTemplatedEmailCommand,
  SendRawEmailCommand
} from '@aws-sdk/client-ses';
import { EmailOptions, EmailResponse } from './interfaces/email.interface';
import * as nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import * as Handlebars from 'handlebars';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailTemplate, EmailTemplateType } from './schema/email-template.schema';

@Injectable()
export class EmailService {
  private readonly sesClient: SESClient;
  private readonly logger = new Logger(EmailService.name);
  private readonly sender: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(EmailTemplate.name) private emailTemplateModel: Model<EmailTemplate>
  ) {
    const senderEmail = this.configService.get<string>('AWS_SES_SENDER_EMAIL');
    if (!senderEmail) {
      throw new Error('AWS_SES_SENDER_EMAIL is not defined in environment variables');
    }
    this.sender = senderEmail;

    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('AWS credentials are not properly configured in environment variables');
    }

    this.sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      if (options.templateData && options.templateType) {
        return this.sendHandlebarsTemplateEmail(options);
      } else if (options.templateId) {
        return this.sendSESTemplateEmail(options);
      } else if (options.attachments && options.attachments.length > 0) {
        return this.sendEmailWithAttachments(options);
      } else {
        return this.sendRawEmail(options);
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  private async sendRawEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, subject, html, text } = options;

      const toAddresses = Array.isArray(to) ? to : [to];
      const ccAddresses = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
      const bccAddresses = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined;

      const command = new SendEmailCommand({
        Source: this.sender,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Message: {
          Subject: {
            Data: subject,
            Charset: 'UTF-8',
          },
          Body: {
            ...(html && {
              Html: {
                Data: html,
                Charset: 'UTF-8',
              },
            }),
            ...(text && {
              Text: {
                Data: text,
                Charset: 'UTF-8',
              },
            }),
          },
        },
      });

      const result = await this.sesClient.send(command);

      return {
        success: true,
        messageId: result.MessageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send raw email: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  private async sendSESTemplateEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, templateId, templateData } = options;

      if (!templateId) {
        throw new Error('Template ID is required for template emails');
      }

      const toAddresses = Array.isArray(to) ? to : [to];
      const ccAddresses = cc ? (Array.isArray(cc) ? cc : [cc]) : undefined;
      const bccAddresses = bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined;

      const command = new SendTemplatedEmailCommand({
        Source: this.sender,
        Destination: {
          ToAddresses: toAddresses,
          CcAddresses: ccAddresses,
          BccAddresses: bccAddresses,
        },
        Template: templateId,
        TemplateData: JSON.stringify(templateData || {}),
      });

      const result = await this.sesClient.send(command);

      return {
        success: true,
        messageId: result.MessageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send template email: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  private async sendHandlebarsTemplateEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, templateType, templateData } = options;

      if (!templateType) {
        throw new Error('Template type is required for Handlebars template emails');
      }

      // Get template from database
      const template = await this.emailTemplateModel.findOne({ type: templateType });
      if (!template) {
        throw new Error(`Template with type ${templateType} not found in the database`);
      }

      // Compile the Handlebars template
      const htmlTemplate = Handlebars.compile(template.htmlContent);
      const htmlContent = htmlTemplate(templateData || {});

      let textContent = '';
      if (template.textContent) {
        const textTemplate = Handlebars.compile(template.textContent);
        textContent = textTemplate(templateData || {});
      }

      // Send the email using the raw email method
      return this.sendRawEmail({
        to,
        cc,
        bcc,
        subject: template.subject,
        html: htmlContent,
        text: textContent || undefined,
      });
    } catch (error) {
      this.logger.error(`Failed to send Handlebars template email: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  private async sendEmailWithAttachments(options: EmailOptions): Promise<EmailResponse> {
    try {
      const { to, cc, bcc, subject, html, text, attachments } = options;

      // Create a Nodemailer transport using SES
      const transporter = nodemailer.createTransport({
        SES: { ses: this.sesClient, aws: { SendRawEmailCommand } },
      });

      // Prepare email data
      const mailOptions: Mail.Options = {
        from: this.sender,
        to: Array.isArray(to) ? to.join(',') : to,
        ...(cc && { cc: Array.isArray(cc) ? cc.join(',') : cc }),
        ...(bcc && { bcc: Array.isArray(bcc) ? bcc.join(',') : bcc }),
        subject,
        ...(html && { html }),
        ...(text && { text }),
        attachments: attachments?.map(attachment => ({
          filename: attachment.filename,
          content: attachment.content,
          contentType: attachment.contentType,
        })),
      };

      // Send email
      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email with attachments: ${error.message}`, error.stack);
      return {
        success: false,
        error,
      };
    }
  }

  async getTemplateByType(type: EmailTemplateType): Promise<EmailTemplate | null> {
    return this.emailTemplateModel.findOne({ type });
  }

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const newTemplate = new this.emailTemplateModel(template);
    return newTemplate.save();
  }

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    return this.emailTemplateModel.findByIdAndUpdate(id, template, { new: true });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.emailTemplateModel.findByIdAndDelete(id);
    return !!result;
  }

  async getAllTemplates(): Promise<EmailTemplate[]> {
    return this.emailTemplateModel.find();
  }
}
