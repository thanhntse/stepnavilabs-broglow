import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SePayService } from './sepay.service';
import { GenerateQrDto } from './dto/generate-qr.dto';
import {
  SePayQrResponse,
  SePayWebhookResponse,
} from './interfaces/sepay.interface';
import { SePayWebhookDto } from './dto/webhook.dto';

@ApiTags('sepay')
@Controller('sepay')
export class SePayController {
  private readonly logger = new Logger(SePayController.name);

  constructor(private readonly sePayService: SePayService) {}

  @Post('generate-qr')
  @ApiOperation({ summary: 'Tạo URL QR code thanh toán SePay' })
  @ApiResponse({
    status: 201,
    description: 'URL QR code đã được tạo thành công',
    type: Object,
  })
  generateQr(@Body() generateQrDto: GenerateQrDto): SePayQrResponse {
    return this.sePayService.generateQrUrl({
      amount: generateQrDto.amount,
      description: generateQrDto.userId,
    });
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Nhận webhook từ SePay khi có giao dịch mới' })
  @ApiResponse({
    status: 200,
    description: 'Webhook đã được xử lý thành công',
    type: Object,
  })
  async handleWebhook(
    @Body() webhookDto: SePayWebhookDto,
  ): Promise<SePayWebhookResponse> {
    this.logger.log('Nhận webhook từ SePay');
    return this.sePayService.processWebhook(webhookDto);
  }

  @Get('check-payment/:referenceCode')
  @ApiOperation({ summary: 'Kiểm tra trạng thái thanh toán' })
  @ApiResponse({
    status: 200,
    description: 'Thông tin trạng thái thanh toán',
    type: Object,
  })
  async checkPaymentStatus(
    @Param('referenceCode') referenceCode: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Kiểm tra trạng thái thanh toán: ${referenceCode}`);
    return this.sePayService.checkPaymentStatus(referenceCode);
  }
}
