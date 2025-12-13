import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class SuspendAccountDto extends CoreActionDto {
  suspendUntil: Date;
  suspensionReason: string;
  targetId: string;

  accountId?: string | null;
}
