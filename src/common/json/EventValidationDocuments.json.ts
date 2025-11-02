import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUrl,
} from 'class-validator';
import { AcceptedEventValidationDocuments } from '@/common/constants/AcceptedEventValidationDocuments.constant';

export class EventValidationDocumentsJson {
  @ApiProperty({
    enum: AcceptedEventValidationDocuments,
    example: AcceptedEventValidationDocuments.EVENT_PERMIT,
  })
  @IsNotEmpty()
  @IsEnum(AcceptedEventValidationDocuments)
  documentType: AcceptedEventValidationDocuments;

  @ApiProperty({ type: String, isArray: true, example: ['http://google.com'] })
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsUrl({}, { each: true })
  documentImageUrls: string[];
}
