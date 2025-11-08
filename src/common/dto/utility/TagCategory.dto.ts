import { ApiProperty } from '@nestjs/swagger';

export class TagCategoryResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Thích yên tĩnh' })
  name: string;

  @ApiProperty({
    example: 'Ưa thích những địa điểm yên tĩnh, thư giãn, gần thiên nhiên',
    required: false,
  })
  description?: string;

  @ApiProperty({ example: '#4CAF50', required: false })
  color?: string;

  @ApiProperty({ example: '🌿', required: false })
  icon?: string;
}
