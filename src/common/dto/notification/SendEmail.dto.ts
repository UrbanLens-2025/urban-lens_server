import { IsBoolean, IsEmail, IsEnum, IsOptional } from 'class-validator';
import { EmailTemplates } from '@/common/constants/EmailTemplates.constant';

export class SendEmailDto {
  @IsEmail()
  to: string;

  @IsEnum(EmailTemplates)
  template: EmailTemplates;

  context: Record<string, any>;
}
