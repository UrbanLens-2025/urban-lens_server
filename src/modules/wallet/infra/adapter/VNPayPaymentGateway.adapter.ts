import { CoreService } from '@/common/core/Core.service';
import { IPaymentGatewayPort } from '@/modules/wallet/app/ports/IPaymentGateway.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VNPayPaymentGatewayAdapter
  extends CoreService
  implements IPaymentGatewayPort
{
  createPaymentUrl(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
