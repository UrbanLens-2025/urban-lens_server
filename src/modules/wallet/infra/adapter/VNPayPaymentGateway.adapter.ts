import { CoreService } from '@/common/core/Core.service';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { Injectable } from '@nestjs/common';
import { PaymentProviderResponseDto } from '@/common/dto/wallet/res/PaymentProvider.response.dto';
import { CreatePaymentLinkDto } from '@/common/dto/wallet/CreatePaymentLink.dto';
import { SupportedPaymentProviders } from '@/common/constants/SupportedPaymentProviders.constant';
import dayjs from 'dayjs';
import qs from 'qs';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@/config/env.config';

@Injectable()
export class VNPayPaymentGatewayAdapter
  extends CoreService
  implements IPaymentGatewayPort
{
  constructor(private readonly configService: ConfigService<Environment>) {
    super();
  }

  private readonly providerName = SupportedPaymentProviders.VNPAY;

  async createPaymentUrl(
    dtoRaw: CreatePaymentLinkDto,
  ): Promise<PaymentProviderResponseDto> {
    const dto = await this.validate(CreatePaymentLinkDto, dtoRaw);
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = dayjs(date).format('YYYYMMDDHHmmss');

    const ipAddr = dto.ipAddress;

    const tmnCode = this.configService.getOrThrow<string>('VNPAY_TMN_CODE');
    const secretKey =
      this.configService.getOrThrow<string>('VNPAY_HASH_SECRET');
    let vnpUrl = this.configService.getOrThrow<string>('VNPAY_URL');
    const returnUrl = dto.returnUrl;
    const orderId = dayjs(date).format('DDHHmmss');
    const amount = dto.amount;
    const bankCode = dto.bankCode ?? '';

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
