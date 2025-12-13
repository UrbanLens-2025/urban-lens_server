import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class SendWarningDto extends CoreActionDto {
  accountId: string;
  warningNote: string;
}
