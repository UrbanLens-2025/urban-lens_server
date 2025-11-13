import { ApiProperty } from '@nestjs/swagger';
import { CategoryType } from '@/common/constants/CategoryType.constant';

export class TagCategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Quiet & Peaceful' })
  name: string;

  @ApiProperty({
    example: 'Prefer quiet, peaceful places close to nature and relaxation',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '#4CAF50', required: false })
  color?: string;

  @ApiProperty({ example: '🌿', required: false })
  icon?: string;

  @ApiProperty({
    type: [String],
    enum: CategoryType,
    example: [CategoryType.USER, CategoryType.LOCATION],
    description:
      'Types this category applies to - can include USER, LOCATION, EVENT. A category can be used for multiple purposes.',
  })
  applicableTypes: CategoryType[];
}
