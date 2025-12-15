import { CoreActionDto } from '@/common/dto/CoreAction.dto';

export class LiftSuspensionDto extends CoreActionDto {
  suspensionId: string;
  accountId?: string | null;
  targetAccountId: string;
}

