import { CoreService } from '@/common/core/Core.service';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaymentProviderResponseDto } from '@/common/dto/wallet/res/PaymentProvider.response.dto';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';
import dayjs from 'dayjs';
import qs from 'qs';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';
import { PaymentProviderConfirmationResponseDto } from '@/common/dto/wallet/res/PaymentProviderConfirmation.response.dto';
import { CreateMockProcessPaymentConfirmationPayloadDto } from '@/common/dto/wallet/CreateMockProcessPaymentConfirmationPayload.dto';

@Injectable()
export class VNPayPaymentGatewayAdapter
  extends CoreService
  implements IPaymentGatewayPort
{
  private readonly providerName = SupportedPaymentProviders.VNPAY;

  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  async createPaymentUrl(
    dtoRaw: CreatePaymentLinkDto,
  ): Promise<PaymentProviderResponseDto> {
    const dto = await this.validate(CreatePaymentLinkDto, dtoRaw);
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');
    const expireDate = dayjs(dto.expiresAt).format('YYYYMMDDHHmmss');

    const ipAddr = dto.ipAddress;

    const tmnCode = this.configService.getOrThrow<string>('VNPAY_TMN_CODE');
    const secretKey =
      this.configService.getOrThrow<string>('VNPAY_HASH_SECRET');
    let vnpUrl = this.configService.getOrThrow<string>('VNPAY_URL');
    const returnUrl = dto.returnUrl;
    const amount = dto.amount;
    const bankCode = dto.bankCode ?? '';
    const orderId = dto.transactionId;

    const locale = 'en';
    const currCode = dto.currency;
    let vnp_Params: {
      [key: string]: string | number;
    } = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = orderId;
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;
    if (bankCode !== null && bankCode !== '') {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', secretKey);
    vnp_Params['vnp_SecureHash'] = hmac
      .update(new Buffer(signData, 'utf-8'))
      .digest('hex');
    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    const response = new PaymentProviderResponseDto();
    response.provider = this.providerName;
    response.paymentUrl = vnpUrl;
    return response;
  }

  processPaymentConfirmation(
    queryParams: Record<string, unknown>,
  ): PaymentProviderConfirmationResponseDto {
    const vnp_TmnCode = String(queryParams['vnp_TmnCode']) || '';

    const vnp_Amount = Number(queryParams['vnp_Amount']) || 0;

    const vnp_BankCode = String(queryParams['vnp_BankCode']) || '';

    const vnp_BankTranNo =
      queryParams['vnp_BankTranNo'] || null
        ? String(queryParams['vnp_BankTranNo'])
        : null;

    const vnp_CardType =
      queryParams['vnp_CardType'] || null
        ? String(queryParams['vnp_CardType'])
        : null;

    const vnp_PayDate = Number(queryParams['vnp_PayDate']) || null;

    const vnp_OrderInfo = String(queryParams['vnp_OrderInfo']) || '';

    const vnp_TransactionNo = Number(queryParams['vnp_TransactionNo']) || 0;

    const vnp_ResponseCode = Number(queryParams['vnp_ResponseCode']) || 0;

    const vnp_TransactionStatus =
      Number(queryParams['vnp_TransactionStatus']) || 0;

    const vnp_TxnRef = String(queryParams['vnp_TxnRef']) || null;

    const vnp_SecureHash = String(queryParams['vnp_SecureHash']) || '';

    if (
      !vnp_TmnCode ||
      vnp_TmnCode !== this.configService.getOrThrow<string>('VNPAY_TMN_CODE')
    ) {
      throw new InternalServerErrorException('Invalid vnp_TmnCode');
    }

    if (!this.configService.getOrThrow<boolean>('PAYMENT_ALLOW_MOCK_HASH')) {
      // TODO validate hash. for now, we skip hash validation
    }

    const response = new PaymentProviderConfirmationResponseDto();
    response.success = vnp_ResponseCode === 0;
    response.amount = vnp_Amount / 100;
    response.bankCode = vnp_BankCode;
    response.bankTransactionNo = vnp_BankTranNo;
    response.cardType = vnp_CardType;
    response.payDate = vnp_PayDate;
    response.orderInfo = vnp_OrderInfo;
    response.providerTransactionId = vnp_TransactionNo.toString();
    response.transactionId = vnp_TxnRef;
    response.rawResponse = {
      vnp_TmnCode,
      vnp_Amount,
      vnp_BankCode,
      vnp_BankTranNo,
      vnp_CardType,
      vnp_PayDate,
      vnp_OrderInfo,
      vnp_TransactionNo,
      vnp_ResponseCode,
      vnp_TransactionStatus,
      vnp_TxnRef,
      vnp_SecureHash,
    };
    return response;
  }

  createMockProcessPaymentConfirmationPayload(
    dto: CreateMockProcessPaymentConfirmationPayloadDto,
  ): Record<string, unknown> {
    return {
      vnp_TmnCode: this.configService.getOrThrow<string>('VNPAY_TMN_CODE'),
      vnp_Amount: dto.amount * 100,
      vnp_TransactionNo: dto.transactionNo,
      vnp_ResponseCode: 0,
      vnp_TransactionStatus: 0,
      vnp_TxnRef: dto.transactionId,
      vnp_PayDate: dayjs().format('YYYYMMDDHHmmss'),
      vnp_OrderInfo: 'Mock order info',
      vnp_BankCode: 'NCB',
      vnp_BankTranNo: '202309150001',
      vnp_CardType: null,
      vnp_SecureHash:
        this.configService.getOrThrow<string>('PAYMENT_MOCK_HASH'),
    };
  }

  private sortObject(obj: any) {
    const sorted = {};
    const str: any[] = [];
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }
    str.sort();
    for (let key = 0; key < str.length; key++) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }
    return sorted;
  }
}
